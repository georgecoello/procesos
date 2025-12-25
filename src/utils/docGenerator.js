/* eslint-disable */
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, ShadingType, Header, LevelFormat, BorderStyle, SimpleField } from 'docx';

/**
 * Genera y descarga un .docx usando la librería 'docx'.
 * Con estilos mejorados similares a la imagen de referencia
 */
export async function generateWordDocument(documentData = {}, procedureData = []) {
  try {
    const formattedDate = formatDate(documentData.headerConfig?.fecha);

    // Crear el documento
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
            id: 'Heading2',
            name: 'Título 2',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 22,
              bold: true,
              color: '2C3E50',
              font: 'Times New Roman'
            },
            paragraph: {
              spacing: { before: 300, after: 150 },
              border: {
                bottom: {
                  color: "E0E0E0",
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 1
                }
              }
            }
          },
          {
            id: 'Heading3',
            name: 'Título 3',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 20,
              bold: true,
              color: '34495E',
              font: 'Times New Roman'
            },
            paragraph: {
              spacing: { before: 200, after: 100 }
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
          },
          {
            id: 'Quote',
            name: 'Cita',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 20,
              font: 'Times New Roman',
              italics: true,
              color: '6C757D'
            },
            paragraph: {
              spacing: { before: 200, after: 200 },
              indent: { left: 720 },
              border: {
                left: {
                  color: "6C757D",
                  space: 1,
                  style: BorderStyle.SINGLE,
                  size: 8
                }
              }
            }
          },
          {
            id: 'Code',
            name: 'Código',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              size: 18,
              font: 'Consolas',
              color: '2C3E50'
            },
            paragraph: {
              spacing: { before: 100, after: 100 },
              shading: {
                fill: 'F8F9FA',
                type: ShadingType.CLEAR
              },
              border: {
                top: { color: "DEE2E6", size: 1, style: BorderStyle.SINGLE },
                bottom: { color: "DEE2E6", size: 1, style: BorderStyle.SINGLE },
                left: { color: "DEE2E6", size: 1, style: BorderStyle.SINGLE },
                right: { color: "DEE2E6", size: 1, style: BorderStyle.SINGLE }
              }
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

// Función para crear la tabla del header con diseño mejorado y paginación dinámica
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
          // Páginas (ocupa 2 columnas) - USANDO CAMPOS DINÁMICOS
          new TableCell({
            columnSpan: 2,
            shading: { fill: '1F4E79', type: ShadingType.CLEAR },
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ 
                  text: "PÁGINA ",
                  bold: true, 
                  size: 20, 
                  font: 'Times New Roman',
                  color: 'FFFFFF'
                }),
                // Campo para número de página actual
                new SimpleField("PAGE", ""),
                new TextRun({ 
                  text: " DE ",
                  bold: true, 
                  size: 20, 
                  font: 'Times New Roman',
                  color: 'FFFFFF'
                }),
                // Campo para número total de páginas
                new SimpleField("NUMPAGES", "")
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
 * Ahora soporta títulos, citas, código y todos los estilos
 */
function parseHtmlToParagraphs(html = '') {
  const paragraphs = [];
  if (!html) return paragraphs;

  try {
    // Si no hay HTML tags, procesar como texto plano
    if (!html.includes('<') && !html.includes('>')) {
      const lines = String(html).split(/\n+/).map(s => safeText(s)).filter(Boolean);
      lines.forEach(line => {
        // Detectar si es un título por el formato (solo si no hay tags HTML)
        if (line.startsWith('# ')) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ 
              text: line.substring(2), 
              size: 28, 
              font: 'Times New Roman',
              bold: true,
              color: '1F4E79'
            })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            border: {
              bottom: {
                color: "1F4E79",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 8
              }
            }
          }));
        } else if (line.startsWith('## ')) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ 
              text: line.substring(3), 
              size: 24, 
              font: 'Times New Roman',
              bold: true,
              color: '2C3E50'
            })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
            border: {
              bottom: {
                color: "D4D4D4",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 2
              }
            }
          }));
        } else if (line.startsWith('### ')) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ 
              text: line.substring(4), 
              size: 20, 
              font: 'Times New Roman',
              bold: true,
              color: '34495E'
            })],
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }));
        } else if (line.startsWith('> ')) {
          // Detectar citas
          paragraphs.push(new Paragraph({
            children: [new TextRun({ 
              text: line.substring(2), 
              size: 20, 
              font: 'Times New Roman',
              italics: true,
              color: '6C757D'
            })],
            style: 'Quote',
            spacing: { before: 200, after: 200 },
            indent: { left: 720 },
            border: {
              left: {
                color: "6C757D",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 8
              }
            }
          }));
        } else {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: line, size: 22, font: 'Times New Roman' })],
            spacing: { after: 120 }
          }));
        }
      });
      return paragraphs;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
    const root = doc.body.firstElementChild || doc.body;

    const processNode = (node, depth = 0) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = safeText(node.textContent);
        if (text && text.trim() !== '') {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text, size: 22, font: 'Times New Roman' })],
            spacing: { after: 120 }
          }));
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const tag = node.tagName.toLowerCase();
      const classList = node.classList;

      // Detectar alineación desde clases
      let textAlign = null;
      if (classList.contains('text-align-left')) textAlign = AlignmentType.LEFT;
      else if (classList.contains('text-align-center')) textAlign = AlignmentType.CENTER;
      else if (classList.contains('text-align-right')) textAlign = AlignmentType.RIGHT;
      else if (classList.contains('text-align-justify')) textAlign = AlignmentType.JUSTIFIED;

      // Manejar títulos
      if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
        const text = safeText(node.textContent);
        if (!text) return;
        
        const level = parseInt(tag.substring(1));
        const children = processInlineContent(node);
        
        if (level === 1) {
          const paragraph = new Paragraph({
            children: children.length > 0 ? children : [new TextRun({ 
              text: text, 
              size: 28, 
              font: 'Times New Roman',
              bold: true,
              color: '1F4E79'
            })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
            border: {
              bottom: {
                color: "1F4E79",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 8
              }
            }
          });
          if (textAlign) paragraph.alignment = textAlign;
          paragraphs.push(paragraph);
        } else if (level === 2) {
          const paragraph = new Paragraph({
            children: children.length > 0 ? children : [new TextRun({ 
              text: text, 
              size: 24, 
              font: 'Times New Roman',
              bold: true,
              color: '2C3E50'
            })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 150 },
            border: {
              bottom: {
                color: "D4D4D4",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 2
              }
            }
          });
          if (textAlign) paragraph.alignment = textAlign;
          paragraphs.push(paragraph);
        } else if (level === 3) {
          const paragraph = new Paragraph({
            children: children.length > 0 ? children : [new TextRun({ 
              text: text, 
              size: 20, 
              font: 'Times New Roman',
              bold: true,
              color: '34495E'
            })],
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          });
          if (textAlign) paragraph.alignment = textAlign;
          paragraphs.push(paragraph);
        }
      }
      // Manejar citas (blockquote)
      else if (tag === 'blockquote') {
        const text = safeText(node.textContent);
        if (text) {
          const children = processInlineContent(node);
          const paragraph = new Paragraph({
            children: children.length > 0 ? children : [new TextRun({ 
              text: text, 
              size: 20, 
              font: 'Times New Roman',
              italics: true,
              color: '6C757D'
            })],
            style: 'Quote',
            spacing: { before: 200, after: 200 },
            indent: { left: 720 },
            border: {
              left: {
                color: "6C757D",
                space: 1,
                style: BorderStyle.SINGLE,
                size: 8
              }
            }
          });
          if (textAlign) paragraph.alignment = textAlign;
          paragraphs.push(paragraph);
        }
      }
      // Manejar bloques de código
      else if (tag === 'pre' || (tag === 'div' && classList.contains('code-block'))) {
        const text = safeText(node.textContent);
        if (text) {
          const paragraph = new Paragraph({
            children: [new TextRun({ 
              text: text, 
              size: 18, 
              font: 'Consolas',
              color: '2C3E50'
            })],
            style: 'Code',
            spacing: { before: 100, after: 100 },
            shading: {
              fill: 'F8F9FA',
              type: ShadingType.CLEAR
            },
            border: {
              top: { color: "DEE2E6", size: 1, style: BorderStyle.SINGLE },
              bottom: { color: "DEE2E6", size: 1, style: BorderStyle.SINGLE },
              left: { color: "DEE2E6", size: 1, style: BorderStyle.SINGLE },
              right: { color: "DEE2E6", size: 1, style: BorderStyle.SINGLE }
            }
          });
          if (textAlign) paragraph.alignment = textAlign;
          paragraphs.push(paragraph);
        }
      }
      // Manejar párrafos
      else if (tag === 'p') {
        const text = safeText(node.textContent);
        if (text) {
          const children = processInlineContent(node);
          const paragraph = new Paragraph({
            children: children.length > 0 ? children : [new TextRun({ text, size: 22, font: 'Times New Roman' })],
            spacing: { after: 120 }
          });
          if (textAlign) paragraph.alignment = textAlign;
          paragraphs.push(paragraph);
        }
      }
      // Manejar listas
      else if (tag === 'ul' || tag === 'ol') {
        const isOrdered = tag === 'ol';
        const outer = node.outerHTML || '';
        const isLetter = /data-type\s*=\s*["']letter["']/i.test(outer);
        const numberingRef = isLetter ? 'letter-numbering' : (isOrdered ? 'decimal-numbering' : 'bullet-numbering');

        node.querySelectorAll('li').forEach(li => {
          const liText = safeText(li.textContent);
          if (!liText) return;
          
          const children = processInlineContent(li);
          const paragraph = new Paragraph({
            children: children.length > 0 ? children : [new TextRun({ text: liText, size: 22, font: 'Times New Roman' })],
            numbering: { reference: numberingRef, level: 0 },
            spacing: { after: 80 },
          });
          if (textAlign) paragraph.alignment = textAlign;
          paragraphs.push(paragraph);
        });
      }
      // Manejar saltos de línea
      else if (tag === 'br') {
        paragraphs.push(new Paragraph({ text: '' }));
      }
      // Manejar divs y otros contenedores (procesar recursivamente)
      else if (tag === 'div' || tag === 'span' || tag === 'section' || tag === 'article') {
        Array.from(node.childNodes).forEach(child => processNode(child, depth + 1));
      }
      // Para otros elementos, extraer el texto
      else {
        const text = safeText(node.textContent);
        if (text) {
          const paragraph = new Paragraph({
            children: [new TextRun({ text, size: 22, font: 'Times New Roman' })],
            spacing: { after: 120 }
          });
          if (textAlign) paragraph.alignment = textAlign;
          paragraphs.push(paragraph);
        }
      }
    };

    // Función para procesar contenido inline con estilos
    const processInlineContent = (element) => {
      const textRuns = [];
      
      const processElement = (elem) => {
        if (elem.nodeType === Node.TEXT_NODE) {
          const text = safeText(elem.textContent);
          if (text) {
            textRuns.push(new TextRun({ 
              text, 
              size: 22, 
              font: 'Times New Roman'
            }));
          }
        } else if (elem.nodeType === Node.ELEMENT_NODE) {
          const elemTag = elem.tagName.toLowerCase();
          const innerText = safeText(elem.textContent);
          
          if (elemTag === 'strong' || elemTag === 'b') {
            textRuns.push(new TextRun({ 
              text: innerText, 
              size: 22, 
              font: 'Times New Roman',
              bold: true
            }));
          } else if (elemTag === 'em' || elemTag === 'i') {
            textRuns.push(new TextRun({ 
              text: innerText, 
              size: 22, 
              font: 'Times New Roman',
              italics: true
            }));
          } else if (elemTag === 'u') {
            textRuns.push(new TextRun({ 
              text: innerText, 
              size: 22, 
              font: 'Times New Roman',
              underline: {}
            }));
          } else if (elemTag === 's' || elemTag === 'strike') {
            textRuns.push(new TextRun({ 
              text: innerText, 
              size: 22, 
              font: 'Times New Roman',
              strike: true
            }));
          } else if (elemTag === 'code') {
            textRuns.push(new TextRun({ 
              text: innerText, 
              size: 20, 
              font: 'Consolas',
              color: 'E74C3C'
            }));
          } else if (elemTag === 'br') {
            // Los saltos de línea se manejan automáticamente
          } else {
            // Para otros elementos, procesar recursivamente
            Array.from(elem.childNodes).forEach(processElement);
          }
        }
      };
      
      Array.from(element.childNodes).forEach(processElement);
      return textRuns;
    };

    Array.from(root.childNodes).forEach(node => processNode(node));

  } catch (e) {
    console.error('Error parsing HTML:', e);
    // Fallback: limpiar HTML y procesar como texto plano
    const cleaned = String(html)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
    
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

    // Procesar texto de actividad para mantener estilos básicos
    const activityChildren = [new TextRun({ 
      text: activity, 
      size: 20,
      font: 'Times New Roman'
    })];

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
            children: activityChildren,
            spacing: { before: 100, after: 100 }
          })],
          shading: bg ? { fill: bg, type: ShadingType.CLEar } : undefined,
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