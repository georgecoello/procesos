/* eslint-disable */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType, Header, LevelFormat, BorderStyle } from 'docx';

/**
 * Genera y descarga un .docx usando la librería 'docx'.
 * Con estilos mejorados similares a la imagen de referencia
 */
export async function generateWordDocument(documentData = {}, procedureData = []) {
  try {
    const formattedDate = formatDate(documentData.headerConfig?.fecha);

    // Crear el documento con estilos mejorados
    const doc = new Document({
      coreProperties: {
        title: documentData.headerConfig?.policyName || 'PROCEDIMIENTO',
        subject: 'Documento de procedimientos',
        creator: 'Sistema',
        description: 'Procedimiento generado automáticamente',
        language: 'es-HN',
        keywords: ['procedimiento', 'políticas', 'Honduras'],
      },
      settings: {
        language: {
          value: 'es-HN',
        },
      },
      features: {
        updateFields: true,
      },
      styles: {
        paragraphStyles: [
          {
            id: 'Title',
            name: 'Título Principal',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 28,
              bold: true,
              color: '1F4E79',
              font: 'Times New Roman'
            },
            paragraph: {
              alignment: AlignmentType.CENTER,
              spacing: { before: 400, after: 300 },
              border: {
                bottom: {
                  color: "1F4E79",
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 8
                }
              }
            }
          },
          {
            id: 'Heading1',
            name: 'Título 1',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 24,
              bold: true,
              color: '2C3E50',
              font: 'Times New Roman'
            },
            paragraph: {
              spacing: { before: 400, after: 200 },
              border: {
                bottom: {
                  color: "D4D4D4",
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 2
                }
              }
            }
          },
          {
            id: 'Normal',
            name: 'Normal',
            basedOn: 'Normal',
            next: 'Normal',
            run: {
              size: 22,
              font: 'Times New Roman'
            },
            paragraph: {
              spacing: { after: 120 }
            }
          }
        ]
      },
      numbering: {
        config: [
          {
            reference: 'bullet-numbering',
            levels: [
              { 
                level: 0, 
                format: LevelFormat.BULLET, 
                text: '•', 
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 360 }
                  }
                }
              },
            ],
          },
          {
            reference: 'decimal-numbering',
            levels: [
              { 
                level: 0, 
                format: LevelFormat.DECIMAL, 
                text: '%1.', 
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 360 }
                  }
                }
              },
            ],
          },
          {
            reference: 'letter-numbering',
            levels: [
              { 
                level: 0, 
                format: LevelFormat.LOWER_LETTER, 
                text: '%1)', 
                alignment: AlignmentType.LEFT,
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 360 }
                  }
                }
              },
            ],
          },
        ],
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [createHeaderTable(documentData, formattedDate)]
          }),
        },
        children: [
          // 1. Objetivo o Propósito
          new Paragraph({
            children: [
              new TextRun({
                text: '1. OBJETIVO O PROPÓSITO',
                bold: true,
                size: 24,
                font: 'Times New Roman',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...parseHtmlToParagraphs(documentData.objetivo || 'Contenido pendiente de completar.'),

          // 2. Alcance
          new Paragraph({
            children: [
              new TextRun({
                text: '2. ALCANCE',
                bold: true,
                size: 24,
                font: 'Times New Roman',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...parseHtmlToParagraphs(documentData.alcance || 'Contenido pendiente de completar.'),

          // 3. Responsabilidades
          new Paragraph({
            children: [
              new TextRun({
                text: '3. RESPONSABILIDADES',
                bold: true,
                size: 24,
                font: 'Times New Roman',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...parseHtmlToParagraphs(documentData.responsabilidades || 'Contenido pendiente de completar.'),

          // 4. Normativa
          new Paragraph({
            children: [
              new TextRun({
                text: '4. NORMATIVA',
                bold: true,
                size: 24,
                font: 'Times New Roman',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...parseHtmlToParagraphs(documentData.normativa || 'Contenido pendiente de completar.'),

          // 5. Procedimiento
          new Paragraph({
            children: [
              new TextRun({
                text: '5. PROCEDIMIENTO',
                bold: true,
                size: 24,
                font: 'Times New Roman',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          createProcedureTable(procedureData),

          // 6. Anexos
          new Paragraph({
            children: [
              new TextRun({
                text: '6. ANEXOS',
                bold: true,
                size: 24,
                font: 'Times New Roman',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...parseHtmlToParagraphs(documentData.anexos || 'Contenido pendiente de completar.'),

          // 7. Términos y Referencias
          new Paragraph({
            children: [
              new TextRun({
                text: '7. TÉRMINOS Y REFERENCIAS',
                bold: true,
                size: 24,
                font: 'Times New Roman',
                color: '2C3E50'
              })
            ],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...parseHtmlToParagraphs(documentData.terminos || 'Contenido pendiente de completar.'),
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `${documentData.headerConfig?.policyName || 'Procedimiento'}.docx`;

    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, fileName);
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 150);
    }

    return true;
  } catch (error) {
    console.error('Error generando documento Word:', error);
    throw new Error(`Error al generar el documento: ${error.message}`);
  }
}

// Función para crear la tabla del header con diseño mejorado
function createHeaderTable(documentData, formattedDate) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    columnWidths: [2275, 2275, 2275, 2275],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "1F4E79" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "1F4E79" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F4E79" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "1F4E79" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "1F4E79" },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: "1F4E79" },
    },
    rows: [
      // Primera fila: Logo, Manual, Páginas
      new TableRow({
        children: [
          // Logo
          new TableCell({
            shading: { fill: '1F4E79', type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                text: "LOGO",
                bold: true,
                size: 20,
                font: 'Times New Roman',
                color: 'FFFFFF'
              })]
            })]
          }),
          // Manual de Políticas y Procedimientos
          new TableCell({
            shading: { fill: '1F4E79', type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                text: documentData.headerConfig?.manualName || 'MANUAL DE POLÍTICAS Y PROCEDIMIENTOS',
                bold: true,
                size: 20,
                font: 'Times New Roman',
                color: 'FFFFFF'
              })]
            })]
          }),
          // Páginas (ocupa 2 columnas)
          new TableCell({
            columnSpan: 2,
            shading: { fill: '1F4E79', type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ 
                  text: "PÁGINA 1 DE 1",
                  bold: true, 
                  size: 20, 
                  font: 'Times New Roman',
                  color: 'FFFFFF'
                })
              ]
            })]
          }),
        ],
      }),
      // Segunda fila: Nombre del Procedimiento y Código
      new TableRow({
        children: [
          // POLÍTICA O PROCEDIMIENTO DE (ocupa 2 columnas)
          new TableCell({
            columnSpan: 2,
            children: [new Paragraph({
              children: [new TextRun({
                text: documentData.headerConfig?.policyName || 'PROCEDIMIENTO',
                bold: true,
                size: 22,
                font: 'Times New Roman',
                color: '1F4E79',
                allCaps: true,
              })]
            })]
          }),
          // CÓDIGO (ocupa 2 columnas)
          new TableCell({
            columnSpan: 2,
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({
                text: `CÓDIGO: ${documentData.headerConfig?.codigo || 'XX-P-XXX-#'}`,
                bold: true,
                size: 20,
                font: 'Times New Roman',
                color: '1F4E79'
              })]
            })]
          }),
        ],
      }),
      // Tercera fila: Área, Unidad, Revisión, Fecha
      new TableRow({
        children: [
          // Área
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: `Área: ${documentData.headerConfig?.area || 'ÁREA RESPONSABLE'}`,
                size: 18,
                font: 'Times New Roman',
                bold: true,
                language: 'es-HN'
              })]
            })]
          }),
          // Unidad
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: `Unidad: ${documentData.headerConfig?.unidad || 'UNIDAD ESPECÍFICA'}`,
                size: 18,
                font: 'Times New Roman',
                bold: true,
                language: 'es-HN'
              })]
            })]
          }),
          // Revisión
          new TableCell({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({
                text: `Revisión: ${documentData.headerConfig?.revision || '(1)'}`,
                size: 18,
                font: 'Times New Roman',
                bold: true,
              })]
            })]
          }),
          // Fecha
          new TableCell({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({
                text: `Fecha: ${formattedDate}`,
                bold: true,
                size: 18,
                font: 'Times New Roman'
              })]
            })]
          }),
        ],
      }),
    ],
  });
}

/* ---------------- Helpers ---------------- */

function formatDate(dateInput) {
  if (!dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }
  
  const d = new Date(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function safeText(value) {
  if (value == null) return '';
  return String(value).replace(/\s+/g, ' ').trim();
}

/**
 * Parsea HTML simple a Paragraphs de docx
 */
function parseHtmlToParagraphs(html = '') {
  const paragraphs = [];
  if (!html) return paragraphs;

  try {
    if (!html.includes('<') && !html.includes('>')) {
      const lines = String(html).split(/\n+/).map(s => safeText(s)).filter(Boolean);
      lines.forEach(line => paragraphs.push(new Paragraph({
        children: [new TextRun({ text: line, size: 22, font: 'Times New Roman' })],
        spacing: { after: 120 }
      })));
      return paragraphs;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.body.firstElementChild || doc.body;

    root.childNodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) {
        const text = safeText(node.textContent);
        if (text) paragraphs.push(new Paragraph({
          children: [new TextRun({ text, size: 22, font: 'Times New Roman' })],
          spacing: { after: 120 }
        }));
        return;
      }

      const tag = node.tagName.toLowerCase();

      if (tag === 'p') {
        const text = safeText(node.textContent);
        if (text) paragraphs.push(new Paragraph({
          children: [new TextRun({ text, size: 22, font: 'Times New Roman' })],
          spacing: { after: 120 }
        }));
      } else if (tag === 'ul' || tag === 'ol') {
        const isOrdered = tag === 'ol';
        const outer = node.outerHTML || '';
        const isLetter = /data-type\s*=\s*["']letter["']/i.test(outer);
        const numberingRef = isLetter ? 'letter-numbering' : (isOrdered ? 'decimal-numbering' : 'bullet-numbering');

        node.querySelectorAll('li').forEach(li => {
          const liText = safeText(li.textContent);
          if (!liText) return;
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: liText, size: 22, font: 'Times New Roman' })],
            numbering: { reference: numberingRef, level: 0 },
            spacing: { after: 80 },
          }));
        });
      } else if (tag === 'br') {
        paragraphs.push(new Paragraph({ text: '' }));
      } else {
        const text = safeText(node.textContent);
        if (text) paragraphs.push(new Paragraph({
          children: [new TextRun({ text, size: 22, font: 'Times New Roman' })],
          spacing: { after: 120 }
        }));
      }
    });
  } catch (e) {
    const cleaned = String(html).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    if (cleaned) {
      cleaned.split(/\n+/).map(s => safeText(s)).filter(Boolean).forEach(t => {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: t, size: 22, font: 'Times New Roman' })],
          spacing: { after: 120 }
        }));
      });
    }
  }

  if (paragraphs.length === 0) paragraphs.push(new Paragraph({ text: '' }));
  return paragraphs;
}

/**
 * Crea una tabla para el procedimiento con diseño mejorado
 */
function createProcedureTable(data = []) {
  if (!data || data.length === 0) {
    return new Paragraph({ 
      children: [new TextRun({ text: 'No se ha definido el procedimiento.', size: 22, font: 'Times New Roman' })],
      spacing: { after: 120 } 
    });
  }

  const headerRow = new TableRow({
    children: [
      new TableCell({
        width: { size: 1500, type: WidthType.DXA },
        shading: { fill: '1F4E79', type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({
          children: [new TextRun({ 
            text: '(#)', 
            bold: true, 
            color: 'FFFFFF',
            size: 20,
            font: 'Times New Roman'
          })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 }
        })],
      }),
      new TableCell({
        width: { size: 2500, type: WidthType.DXA },
        shading: { fill: '1F4E79', type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({
          children: [new TextRun({ 
            text: '(QUIÉN)', 
            bold: true, 
            color: 'FFFFFF',
            size: 20,
            font: 'Times New Roman'
          })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 }
        })],
      }),
      new TableCell({
        width: { size: 6500, type: WidthType.DXA },
        shading: { fill: '1F4E79', type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        children: [new Paragraph({
          children: [new TextRun({ 
            text: '(ACTIVIDAD)', 
            bold: true, 
            color: 'FFFFFF',
            size: 20,
            font: 'Times New Roman'
          })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 100 }
        })],
      }),
    ],
  });

  const rows = [headerRow];

  data.forEach((row, index) => {
    let number = safeText(row.number || '');
    if (number) {
      if (!number.includes('.') && !isNaN(number)) number = `5.${number}`;
      else if (!number.startsWith('5.')) {
        const segs = number.split('.');
        if (segs.every(s => /^\d+$/.test(s.trim()))) number = `5.${number}`;
      }
    }

    const who = safeText(row.who || '');
    const activity = safeText(row.activity || '');
    const level = safeText(row.level || '');
    const bg = getBackgroundColor(level);

    rows.push(new TableRow({
      children: [
        new TableCell({
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          children: [new Paragraph({
            children: [new TextRun({ 
              text: number, 
              size: 20,
              font: 'Times New Roman',
              bold: true
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 }
          })],
          shading: bg ? { fill: bg, type: ShadingType.CLEAR } : undefined,
        }),
        new TableCell({
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          children: [new Paragraph({
            children: [new TextRun({ 
              text: who, 
              size: 20,
              font: 'Times New Roman',
              bold: true
            })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 }
          })],
          shading: bg ? { fill: bg, type: ShadingType.CLEAR } : undefined,
        }),
        new TableCell({
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          children: [new Paragraph({
            children: [new TextRun({ 
              text: activity, 
              size: 20,
              font: 'Times New Roman'
            })],
            spacing: { before: 100, after: 100 }
          })],
          shading: bg ? { fill: bg, type: ShadingType.CLEAR } : undefined,
        }),
      ],
    }));
  });

  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: '1F4E79' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: '1F4E79' },
      left: { style: BorderStyle.SINGLE, size: 2, color: '1F4E79' },
      right: { style: BorderStyle.SINGLE, size: 2, color: '1F4E79' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
  });
}

function getBackgroundColor(level) {
  const colors = {
    sub: 'E8F5E8',
    section: 'E3F2FD',
    question: 'FFF3CD',
    alternative: 'D1ECF1',
    end: 'D4EDDA',
  };
  return colors[level] || '';
}