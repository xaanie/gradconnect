import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SchemeOfWork, LessonPlan, FlashcardSet, Assessment, ExamPaper, Subject } from '../types';

// --- Helper: Generate simple PDF Blob from text ---
export const createPDFBlobFromText = (title: string, content: string): Blob => {
  const doc = new jsPDF();
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const splitTitle = doc.splitTextToSize(title, 170);
  doc.text(splitTitle, 105, 15, { align: 'center' });
  
  // Content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  const pageHeight = doc.internal.pageSize.height;
  const marginBottom = 20;
  let y = 15 + (splitTitle.length * 7) + 10;
  
  const splitContent = doc.splitTextToSize(content, 180);
  
  splitContent.forEach((line: string) => {
    if (y > pageHeight - marginBottom) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 15, y);
    y += 5;
  });
  
  return doc.output('blob');
};

// --- Scheme of Work PDF Generator ---
export const generatePDF = (schemes: SchemeOfWork[]) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  schemes.forEach((scheme, index) => {
    if (index > 0) {
      doc.addPage();
    }

    // --- Header Section ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    // Top Center Title
    const title = `${scheme.grade.toUpperCase()} HBC SCHEME-CUM ${scheme.term.toUpperCase()} ${scheme.year}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(title, pageWidth / 2, 15, { align: 'center' });
    
    // Subject Title
    doc.setFontSize(12);
    doc.text(`${scheme.grade.toUpperCase()} ${scheme.subject.toUpperCase()} ${scheme.term.toUpperCase()} ${scheme.year}`, 14, 25);
    
    // Teacher Name Right Aligned
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Teacher: ${scheme.teacherName}`, pageWidth - 14, 25, { align: 'right' });

    let currentY = 35;

    // --- Topics Covered ---
    doc.setFont('helvetica', 'bold');
    doc.text("TOPICS TO BE COVERED:", 14, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    if (scheme.topicsCovered && scheme.topicsCovered.length > 0) {
        scheme.topicsCovered.forEach((topic, i) => {
            doc.text(`${i + 1}. ${topic}`, 20, currentY);
            currentY += 5;
        });
    } else {
        doc.text("• As per syllabus scope and sequence.", 20, currentY);
        currentY += 5;
    }
    currentY += 2;

    // --- Aims ---
    doc.setFont('helvetica', 'bold');
    doc.text("AIMS:", 14, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text("Pupils should be able to:", 14, currentY);
    currentY += 5;
    scheme.aims.forEach((aim) => {
        const splitAim = doc.splitTextToSize(`• ${aim}`, 270);
        doc.text(splitAim, 20, currentY);
        currentY += (splitAim.length * 4);
    });
    currentY += 2;

    // --- Cross Cutting Issues ---
    if (scheme.crossCuttingIssues && scheme.crossCuttingIssues.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text("CROSS CUTTING ISSUES:", 14, currentY);
        currentY += 5;
        doc.setFont('helvetica', 'normal');
        const issues = scheme.crossCuttingIssues.join(', ');
        const splitIssues = doc.splitTextToSize(issues, 270);
        doc.text(splitIssues, 20, currentY);
        currentY += (splitIssues.length * 4);
    }
    
    // --- Time Allocation ---
    currentY += 2;
    doc.setFont('helvetica', 'bold');
    doc.text("TIME ALLOCATION:", 14, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text("• For adequate coverage of the syllabus, appropriate periods should be allocated per week.", 20, currentY);
    currentY += 8;

    // --- References ---
    doc.setFont('helvetica', 'bold');
    doc.text("REFERENCES:", 14, currentY);
    currentY += 5;
    doc.setFont('helvetica', 'normal');
    doc.text(`• Junior ${scheme.subject} Syllabus MoPSE 2024`, 20, currentY);
    currentY += 5;
    doc.text(`• Relevant ${scheme.subject} Learner's Book Grade ${scheme.grade.split(' ')[1]}`, 20, currentY);
    currentY += 10;

    // Check if we need a new page for the table
    if (currentY > 150) {
        doc.addPage();
        currentY = 20;
    }

    // --- Table ---
    const tableHeaders = [
      ["WEEK\nENDING", "TOPIC/\nCONTENT", "OBJECTIVES", "SKILLS", "S.O.M", "MEDIA", "TEACHING/ LEARNING ACTIVITIES/ METHODS", "EVALUATION"]
    ];

    // Process data to include Weekly Aim rows
    const tableBody = [];
    
    let lastWeek = 0;

    scheme.entries.forEach(entry => {
        // Add a row for Weekly Aim if it exists and it's a new week
        if (entry.week !== lastWeek && entry.weeklyAim) {
             tableBody.push([
                { content: `Weekly Aim(s): ${entry.weeklyAim}`, colSpan: 8, styles: { fontStyle: 'italic', fillColor: [240, 240, 240], halign: 'left', font: 'helvetica' } }
             ]);
             lastWeek = entry.week;
        }

        tableBody.push([
            `Week ${entry.week}\n${entry.weekEnding || ''}`,
            `${entry.lessonLabel || ''}\n${entry.topic}\n\n${entry.subTopic ? `Sub topic:\n${entry.subTopic}` : ''}`,
            entry.objectives.join('\n'),
            entry.skills.join('\n'),
            entry.som,
            entry.media,
            entry.activities.join('\n\n'), // Double newline for clearer separation of steps
            entry.evaluation || ''
        ]);
    });

    autoTable(doc, {
      startY: currentY,
      head: tableHeaders,
      body: tableBody,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
        textColor: [0, 0, 0],
        font: 'helvetica',
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [255, 255, 255], // White header as per sample style
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      },
      columnStyles: {
        0: { cellWidth: 15 }, // Week
        1: { cellWidth: 35 }, // Topic (Containing Lesson Label)
        2: { cellWidth: 40 }, // Objectives
        3: { cellWidth: 20 }, // Skills
        4: { cellWidth: 20 }, // SOM
        5: { cellWidth: 20 }, // Media
        6: { cellWidth: 90 }, // Activities (Widest)
        7: { cellWidth: 25 }  // Evaluation
      },
      didDrawPage: (data) => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.setFontSize(8);
        doc.text(`Generated by ZimEd Planner - Page ${doc.getNumberOfPages()}`, 14, pageHeight - 10);
      }
    });
  });

  doc.save(`${schemes[0].grade}_HBC_Scheme_of_Work_${schemes[0].year}.pdf`);
};

// --- Lesson Plan PDF Generator ---
export const generateLessonPDF = (plan: LessonPlan) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // --- Title ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text("DETAILED LESSON PLAN", 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // --- Header Table (Date, Time, etc) ---
  autoTable(doc, {
    startY: 20,
    body: [
      [
        { content: 'DATE', styles: { fontStyle: 'bold', cellWidth: 35 } }, 
        { content: plan.date || '', styles: { cellWidth: 60 } }, 
        { content: 'TIME', styles: { fontStyle: 'bold', cellWidth: 35 } }, 
        { content: `${plan.duration || 0} mins`, styles: { cellWidth: 60 } }
      ],
      [
        { content: 'GRADE', styles: { fontStyle: 'bold' } }, 
        plan.grade || '', 
        { content: 'SUBJECT', styles: { fontStyle: 'bold' } }, 
        plan.subject || ''
      ],
      [
        { content: 'TOPIC', styles: { fontStyle: 'bold' } }, 
        plan.topic || '', 
        { content: 'TEACHER', styles: { fontStyle: 'bold' } }, 
        plan.teacherName || ''
      ],
      [
        { content: 'SUB-TOPIC', styles: { fontStyle: 'bold' } }, 
        { content: plan.subTopic || 'N/A', colSpan: 3 }
      ],
    ],
    styles: { 
      cellPadding: 2, 
      fontSize: 10, 
      lineColor: [0,0,0], 
      lineWidth: 0.1,
      font: 'helvetica'
    },
    // Enforce grid lines for this specific table style
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.1,
    theme: 'grid', // 'grid' gives borders to all cells
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
    margin: { left: 10, right: 10 }
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // --- Objectives ---
  doc.setFont('helvetica', 'bold');
  doc.text("OBJECTIVES:", 10, currentY);
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  doc.text("By the end of the lesson, learners should be able to:", 10, currentY);
  currentY += 5;
  
  const objectives = Array.isArray(plan.objectives) ? plan.objectives : [];
  if (objectives.length > 0) {
    objectives.forEach(obj => {
      // Clean up bullet points if AI adds them
      const cleanObj = obj.replace(/^[•\-\*]\s*/, '');
      doc.text(`• ${cleanObj}`, 15, currentY);
      currentY += 5;
    });
  } else {
    doc.text("• (No objectives generated)", 15, currentY);
    currentY += 5;
  }
  currentY += 2;

  // --- SOM / Media / Materials ---
  doc.setFont('helvetica', 'bold');
  doc.text("SOM / MEDIA / MATERIALS:", 10, currentY);
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  const materialsText = Array.isArray(plan.materials) ? plan.materials.join(', ') : '';
  const splitMaterials = doc.splitTextToSize(materialsText, 190);
  doc.text(splitMaterials, 10, currentY);
  currentY += (splitMaterials.length * 5) + 2;

  // --- Assumed Knowledge ---
  doc.setFont('helvetica', 'bold');
  doc.text("ASSUMED KNOWLEDGE:", 10, currentY);
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  const akText = plan.assumedKnowledge || 'Learners have basic understanding.';
  const splitAK = doc.splitTextToSize(akText, 190);
  doc.text(splitAK, 15, currentY);
  currentY += (splitAK.length * 5) + 5;

  // --- Lesson Development Table ---
  doc.setFont('helvetica', 'bold');
  doc.text("LESSON DEVELOPMENT:", 10, currentY);
  currentY += 2;

  const steps = Array.isArray(plan.lessonSteps) ? plan.lessonSteps : [];
  
  const stepsBody = steps.map(step => [
    step.stage || '',
    step.time || '',
    step.teacherActivity || '',
    step.learnerActivity || '',
    step.methods || ''
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Stage', 'Time', "Teacher's Activity", "Learner's Activity", 'Methods/Competencies']],
    body: stepsBody.length > 0 ? stepsBody : [['', '', '', '', '']],
    theme: 'grid',
    styles: { 
        fontSize: 9, 
        cellPadding: 3, 
        lineColor: [0, 0, 0], 
        lineWidth: 0.1, 
        overflow: 'linebreak', 
        valign: 'top',
        textColor: [0, 0, 0] 
    },
    headStyles: { 
        fillColor: [230, 230, 230], // Light gray header
        textColor: [0, 0, 0], 
        fontStyle: 'bold', 
        lineWidth: 0.1, 
        lineColor: [0,0,0],
        halign: 'left'
    },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold' }, // Stage
      1: { cellWidth: 15 }, // Time
      2: { cellWidth: 50 }, // Teacher
      3: { cellWidth: 50 }, // Learner
      4: { cellWidth: 50 }  // Methods
    },
    margin: { left: 10, right: 10 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // --- Evaluation Box ---
  // Ensure we have enough space for the evaluation box
  if (currentY > 250) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text("EVALUATION:", 10, currentY);
  currentY += 5;
  
  // Large empty rectangle for evaluation
  doc.setLineWidth(0.1);
  doc.rect(10, currentY, 190, 35);
  
  doc.save(`${plan.subject.replace(/\s+/g, '_')}_LessonPlan_${plan.date}.pdf`);
};

// --- Flashcard PDF Generator ---
export const generateFlashcardsPDF = (set: FlashcardSet) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Flashcards: ${set.topic} (${set.grade})`, 105, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${set.subject} - Generated by ZimEd Planner`, 105, 22, { align: 'center' });
  
  // Config
  // A4 is 210mm wide. Center two 85mm cards = 170mm total width. Margin = (210-170)/2 = 20mm
  const cardWidth = 85; 
  const cardHeight = 55;
  const xMargin = 20;
  const yStart = 30;
  const gap = 0; // Cut and fold, so no gap between Front and Back pair
  
  let y = yStart;
  
  set.cards.forEach((card, i) => {
    // Check if space exists on page
    if (y + cardHeight > 280) {
      doc.addPage();
      y = 20;
    }
    
    // Draw Front Rect (Left)
    doc.setLineWidth(0.3);
    doc.rect(xMargin, y, cardWidth, cardHeight);
    
    // Draw Back Rect (Right)
    doc.rect(xMargin + cardWidth + gap, y, cardWidth, cardHeight);
    
    // Front Text (Centered in Left Box)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    // Wrap text
    const frontLines = doc.splitTextToSize(card.front, cardWidth - 10);
    // Vertical centering logic
    const frontTextHeight = frontLines.length * 5; // approx 5mm line height
    const frontY = y + (cardHeight/2);
    doc.text(frontLines, xMargin + (cardWidth/2), frontY, { align: 'center', baseline: 'middle' });
    
    // Back Text (Centered in Right Box)
    doc.setFont('helvetica', 'normal');
    const backLines = doc.splitTextToSize(card.back, cardWidth - 10);
    const backY = y + (cardHeight/2);
    doc.text(backLines, xMargin + cardWidth + gap + (cardWidth/2), backY, { align: 'center', baseline: 'middle' });
    
    // Cut/Fold Lines
    // Dashed line in middle for folding
    doc.setLineDash([3, 3], 0);
    doc.line(xMargin + cardWidth, y, xMargin + cardWidth, y + cardHeight);
    doc.setLineDash([], 0); // Reset to solid
    
    // Labels (tiny)
    doc.setFontSize(6);
    doc.setTextColor(150);
    doc.text("FRONT (Question)", xMargin + 2, y + 4);
    doc.text("BACK (Answer) - FOLD HERE", xMargin + cardWidth + 2, y + 4);
    doc.setTextColor(0);
    
    // Move Y down
    y += cardHeight + 5; // 5mm gap between separate flashcard units
  });
  
  doc.save(`${set.topic}_Flashcards.pdf`);
};

// --- Assessment PDF Generator ---
export const generateAssessmentPDF = (assessment: Assessment) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
  const drawHeader = (title: string, sub: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text("ASSESSMENT TEST", 105, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text(title.toUpperCase(), 105, 22, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`${assessment.grade} ${assessment.subject}`, 105, 28, { align: 'center' });
      doc.text(sub, 105, 33, { align: 'center' });
      
      // Name field
      doc.text("Name: _______________________________   Date: _______________", 15, 42);
      doc.text(`Total Marks: ${assessment.totalMarks}`, 150, 42, { align: 'right' });
      
      doc.setLineWidth(0.5);
      doc.line(15, 45, 195, 45);
  };

  // --- Student Copy ---
  drawHeader(assessment.title, "(STUDENT COPY)");
  
  let y = 55;
  let isComposition = false;

  // Render Passage if it exists
  if (assessment.passage) {
     doc.setFont('helvetica', 'bold');
     doc.text("READING PASSAGE:", 15, y);
     y += 6;
     doc.setFont('helvetica', 'normal');
     doc.setFontSize(10);
     const splitPassage = doc.splitTextToSize(assessment.passage, 180);
     doc.text(splitPassage, 15, y);
     y += (splitPassage.length * 5) + 10;
  }

  let currentSection = "";

  assessment.questions.forEach((q, i) => {
    // Check composition
    if (q.type === 'composition') {
        isComposition = true;
    }

    // Check page break
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    // Section Header
    if (q.section && q.section !== currentSection) {
        currentSection = q.section;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        
        // Special Header for Composition
        if (q.type === 'composition') {
            doc.text(`SECTION ${currentSection}: CHOOSE ONE TOPIC`, 15, y);
        } else {
            doc.text(`SECTION ${currentSection}`, 15, y);
        }
        y += 6;
    }

    // Question Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const qText = `${i + 1}. ${q.question} (${q.marks} marks)`;
    const splitQ = doc.splitTextToSize(qText, 170);
    doc.text(splitQ, 15, y);
    y += (splitQ.length * 5) + 2;

    // Options for MCQ
    if (q.type === 'mcq' && q.options) {
        q.options.forEach(opt => {
             doc.text(opt, 20, y);
             y += 5;
        });
        y += 2;
    } else if (q.type === 'structured') {
        // Lines for Structured
        const lines = Math.max(2, q.marks * 2); // 2 lines min, or based on marks
        doc.setLineWidth(0.1);
        doc.setDrawColor(200);
        for(let l=0; l<lines; l++) {
            if (y > 275) { doc.addPage(); y=20; }
            doc.line(20, y, 190, y);
            y += 8;
        }
        doc.setDrawColor(0);
        y += 2;
    }
    // For Composition, we list topics here, but don't add lines *immediately* per question
    // We add pages at the end.
  });

  // If Composition, add lined pages
  if (isComposition) {
      doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.text("ANSWER SHEET", 105, 15, { align: 'center' });
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text("Write your composition below:", 15, 25);
      
      let lineY = 35;
      // Add 2 pages of lines
      for (let p = 0; p < 2; p++) {
        doc.setLineWidth(0.1);
        doc.setDrawColor(150);
        while (lineY < 280) {
            doc.line(15, lineY, 195, lineY);
            lineY += 10;
        }
        if (p < 1) {
            doc.addPage();
            lineY = 20;
        }
      }
      doc.setDrawColor(0);
  }

  // --- Teacher Copy (Marking Guide) ---
  doc.addPage();
  drawHeader(assessment.title, "(MARKING GUIDE)");
  
  y = 55;
  currentSection = "";
  
  doc.setFontSize(10);

  assessment.questions.forEach((q, i) => {
     if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
     // Section Header
    if (q.section && q.section !== currentSection) {
        currentSection = q.section;
        doc.setFont('helvetica', 'bold');
        doc.text(`SECTION ${currentSection}`, 15, y);
        y += 6;
    }
    
    // Q + Answer
    doc.setFont('helvetica', 'bold');
    doc.text(`${i+1}. ${q.question}`, 15, y);
    y += 5;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 100, 0); // Green color for answers
    
    let ansText = `ANSWER: ${q.answer}  [${q.marks} marks]`;
    if (q.type === 'composition') {
        ansText = "ANSWER: Content should be relevant, grammatically correct, and well-structured. (Refer to standard Composition Marking Grid).";
    }

    const splitAns = doc.splitTextToSize(ansText, 170);
    doc.text(splitAns, 20, y);
    doc.setTextColor(0);
    
    y += (splitAns.length * 5) + 5;
  });

  doc.save(`${assessment.topic}_Assessment.pdf`);
};

// --- End of Term Exam PDF Generator ---
export const generateExamPDF = (exam: ExamPaper) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  const isIndigenous = exam.subject === Subject.Indigenous;

  // Localization logic for Indigenous Language (Shona)
  const labels = isIndigenous ? {
      title: exam.term.includes('3') ? "BVUNZO DZEKUPERA KWEGORE" : "BVUNZO DZEKUPERA KWETERMU",
      time: "NGUVA",
      instructionsHeader: "MIRAIRO KUVANYORI",
      instructions: [
          "Nyora zita rako negiredhi pabepa remhinduro.",
          `Bepa rino rine zvikamu ${exam.sections.length} zvinoti: ${exam.sections.map(s => s.name).join(', ')}.`,
          "Pindura mibvunzo yose muChikamu A neChikamu B.",
          "Pindura mibvunzo muChikamu C sekurairwa kwazvakaitwa.",
          "Nyora zvakatsvinda uye zvinoraveka."
      ],
      footer: "Bepa rebvunzo rine mapeji akaprindwa."
  } : {
      title: "END OF TERM EXAMINATION",
      time: "TIME",
      instructionsHeader: "INSTRUCTIONS TO CANDIDATES",
      instructions: [
          "Write your name and grade on the answer sheet provided.",
          `This paper consists of ${exam.sections.length} sections: ${exam.sections.map(s => s.name).join(', ')}.`,
          "Answer all questions in Section A and Section B.",
          "Answer questions from Section C as instructed.",
          "Handwriting must be neat and legible."
      ],
      footer: "This question paper consists of printed pages."
  };

  // --- COVER PAGE ---
  
  // Double Border
  doc.setLineWidth(1);
  doc.rect(10, 10, width - 20, height - 20); // Outer
  doc.setLineWidth(0.3);
  doc.rect(12, 12, width - 24, height - 24); // Inner

  let y = 30;

  // School/Institution Name
  doc.setFont('times', 'bold');
  doc.setFontSize(22);
  const splitSchool = doc.splitTextToSize(exam.schoolName.toUpperCase(), 160);
  doc.text(splitSchool, width / 2, y, { align: 'center' });
  y += (splitSchool.length * 10) + 10;

  // Exam Title
  doc.setFontSize(16);
  doc.text(labels.title, width / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(14);
  doc.text(`${exam.term} ${exam.year}`, width / 2, y, { align: 'center' });
  y += 20;

  // Grade & Subject
  doc.setFontSize(18);
  doc.text(`${exam.grade.toUpperCase()}`, width / 2, y, { align: 'center' });
  y += 10;
  doc.text(exam.subject.toUpperCase(), width / 2, y, { align: 'center' });
  y += 25;

  // Time
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`${labels.time}:  ${exam.duration}`, 20, y);
  y += 20;

  // Instructions
  doc.setFont('helvetica', 'bold');
  doc.text(labels.instructionsHeader, 20, y);
  y += 8;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  
  labels.instructions.forEach(inst => {
    doc.text(`• ${inst}`, 25, y);
    y += 7;
  });

  y += 10;
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.text(labels.footer, width/2, height - 20, { align: 'center' });

  // --- CONTENT PAGES ---
  
  // Reset for content
  const startNewPage = () => {
    doc.addPage();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${exam.subject} - ${exam.term} ${exam.year}`, width - 60, 10);
    return 20;
  };

  y = startNewPage();

  exam.sections.forEach((section) => {
    if (y > 250) y = startNewPage();

    // Section Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${section.name.toUpperCase()} [${section.sectionMarks} Marks]`, width / 2, y, { align: 'center' });
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(section.guidance, width / 2, y, { align: 'center' });
    y += 10;
    doc.setFont('helvetica', 'normal');

    section.questions.forEach((q, i) => {
        if (y > 270) y = startNewPage();

        // Question Number and Text
        const qNum = `${q.id}.`;
        const qText = q.question;
        const marks = `[${q.marks}]`;

        // Draw Marks on right
        doc.text(marks, width - 20, y, { align: 'right' });

        // Draw Question Text wrapped
        const textWidth = width - 40; // 20 margins
        const splitText = doc.splitTextToSize(qText, textWidth);
        doc.text(qNum, 15, y);
        doc.text(splitText, 25, y);
        
        y += (splitText.length * 5) + 3;

        // Render Options or Lines
        if (q.type === 'mcq' && q.options) {
            q.options.forEach(opt => {
                if (y > 280) y = startNewPage();
                doc.text(opt, 30, y);
                y += 5;
            });
            y += 3;
        } else if (q.type === 'structured') {
            const lines = Math.max(1, q.marks);
            doc.setLineWidth(0.1);
            doc.setDrawColor(150);
            for(let l=0; l<lines; l++) {
                 if (y > 280) y = startNewPage();
                 doc.line(25, y+2, width-25, y+2);
                 y += 8;
            }
            doc.setDrawColor(0);
            y += 2;
        } else if (q.type === 'composition') {
             y += 5; // Just space, they write on separate sheet
        }
    });
    
    y += 10; // Space between sections
  });

  // --- MARKING GUIDE ---
  doc.addPage();
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text("MARKING GUIDE (TEACHER'S COPY)", width/2, 20, { align: 'center' });
  
  y = 30;
  
  exam.sections.forEach(section => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(section.name, 15, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      section.questions.forEach(q => {
          if (y > 270) {
              doc.addPage();
              y = 20;
          }
          const ansText = `${q.id}. ${q.answer}`;
          const splitAns = doc.splitTextToSize(ansText, width - 30);
          doc.text(splitAns, 15, y);
          y += (splitAns.length * 5) + 2;
      });
      y += 10;
  });

  doc.save(`${exam.subject}_End_Term_Exam.pdf`);
};
