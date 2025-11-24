/* eslint-disable */
import JSZip from 'jszip';

export function generateWordDocument(documentData, procedureData) {
    return new Promise(async (resolve, reject) => {
        try {
            // Obtener fecha actual o usar la proporcionada
            const today = documentData.headerConfig?.fecha ? 
                new Date(documentData.headerConfig.fecha) : new Date();
            const day = today.getDate().toString().padStart(2, '0');
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const year = today.getFullYear();
            // CORRECCIÓN: Usar guiones normales
            const formattedDate = `${day}-${month}-${year}`;

            // Crear contenido principal del documento
            const documentContent = generateDocumentContent(documentData, procedureData, formattedDate);
            
            // Crear el archivo .docx (formato Word moderno)
            const zip = new JSZip();
            
            // Agregar la estructura básica de un documento .docx (Office Open XML)
            zip.file("[Content_Types].xml", getContentTypes());
            zip.file("_rels/.rels", getRels());
            zip.file("docProps/app.xml", getAppProperties());
            zip.file("docProps/core.xml", getCoreProperties());
            zip.file("word/_rels/document.xml.rels", getDocumentRels());
            zip.file("word/document.xml", documentContent);
            zip.file("word/header1.xml", generateHeader(documentData, formattedDate));
            zip.file("word/settings.xml", getDocumentSettings());
            zip.file("word/webSettings.xml", getWebSettings());
            zip.file("word/styles.xml", getDocumentStyles());
            zip.file("word/fontTable.xml", getFontTable());
            zip.file("word/theme/theme1.xml", getTheme());

            // Generar el archivo .docx con mimeType correcto
            const blob = await zip.generateAsync({
                type: "blob",
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                compression: "DEFLATE"
            });

            // Descargar el archivo con extensión .docx
            const fileName = `${documentData.headerConfig?.policyName || 'Procedimiento'}.docx`;
            
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                // Para Internet Explorer
                window.navigator.msSaveOrOpenBlob(blob, fileName);
            } else {
                // Para otros navegadores
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                
                // Limpiar
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
            }
            
            resolve(true);
        } catch (error) {
            reject(error);
        }
    });
}

// Función para generar el contenido principal del documento
function generateDocumentContent(documentData, procedureData, formattedDate) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
            xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:v="urn:schemas-microsoft-com:vml">
    <w:body>
        ${generateObjectiveSection(documentData.objetivo)}
        ${generateScopeSection(documentData.alcance)}
        ${generateResponsibilitiesSection(documentData.responsabilidades)}
        ${generateNormativaSection(documentData.normativa)}
        ${generateProcedureSection(procedureData)}
        ${generateAnexosSection(documentData.anexos)}
        ${generateTermsSection(documentData.terminos)}
        <w:sectPr>
            <w:headerReference w:type="default" r:id="rId6"/>
            <w:pgSz w:w="11906" w:h="16838"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
            <w:cols w:space="720"/>
            <w:docGrid w:linePitch="360"/>
        </w:sectPr>
    </w:body>
</w:document>`;
}

// Función para generar el header
function generateHeader(documentData, formattedDate) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
       xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
       xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
    <w:tbl>
        <w:tblPr>
            <w:tblW w:w="0" w:type="auto"/>
            <w:tblBorders>
                <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            </w:tblBorders>
            <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
        </w:tblPr>
        <w:tblGrid>
            <w:gridCol w:w="2275"/>
            <w:gridCol w:w="2275"/>
            <w:gridCol w:w="2275"/>
            <w:gridCol w:w="2275"/>
        </w:tblGrid>
        <!-- Fila 1: Logo | Manual | Página -->
        <w:tr w:rsidR="00A87A6F" w:rsidTr="00A87A6F">
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="2275" w:type="dxa"/>
                    <w:tcBorders>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    </w:tcBorders>
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:t>Logo</w:t>
                    </w:r>
                </w:p>
            </w:tc>
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="2275" w:type="dxa"/>
                    <w:tcBorders>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    </w:tcBorders>
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F" w:rsidP="00A87A6F">
                    <w:pPr>
                        <w:jc w:val="center"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:t>${escapeXML(documentData.headerConfig?.manualName || 'Manual de Políticas y Procedimientos')}</w:t>
                    </w:r>
                </w:p>
            </w:tc>
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="4550" w:type="dxa"/>
                    <w:gridSpan w:val="2"/>
                    <w:tcBorders>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    </w:tcBorders>
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F" w:rsidP="00A87A6F">
                    <w:pPr>
                        <w:jc w:val="right"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:t>Página </w:t>
                    </w:r>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:fldChar w:fldCharType="begin"/>
                    </w:r>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:instrText> PAGE </w:instrText>
                    </w:r>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:fldChar w:fldCharType="separate"/>
                    </w:r>
                    <w:r w:rsidR="00A87A6F">
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                            <w:noProof/>
                        </w:rPr>
                        <w:t>1</w:t>
                    </w:r>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:fldChar w:fldCharType="end"/>
                    </w:r>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:t> de </w:t>
                    </w:r>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:fldChar w:fldCharType="begin"/>
                    </w:r>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:instrText> NUMPAGES </w:instrText>
                    </w:r>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:fldChar w:fldCharType="separate"/>
                    </w:r>
                    <w:r w:rsidR="00A87A6F">
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                            <w:noProof/>
                        </w:rPr>
                        <w:t>2</w:t>
                    </w:r>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="22"/>
                        </w:rPr>
                        <w:fldChar w:fldCharType="end"/>
                    </w:r>
                </w:p>
            </w:tc>
        </w:tr>
        <!-- Fila 2: Título del procedimiento | Código -->
        <w:tr w:rsidR="00A87A6F" w:rsidTr="00A87A6F">
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="4550" w:type="dxa"/>
                    <w:gridSpan w:val="2"/>
                    <w:tcBorders>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    </w:tcBorders>
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="24"/>
                            <w:smallCaps/>
                        </w:rPr>
                        <w:t>${escapeXML(documentData.headerConfig?.policyName || 'PROCEDIMIENTO')}</w:t>
                    </w:r>
                </w:p>
            </w:tc>
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="4550" w:type="dxa"/>
                    <w:gridSpan w:val="2"/>
                    <w:tcBorders>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    </w:tcBorders>
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F" w:rsidP="00A87A6F">
                    <w:pPr>
                        <w:jc w:val="right"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="20"/>
                        </w:rPr>
                        <w:t>CÓDIGO: ${escapeXML(documentData.headerConfig?.codigo || 'XX-P-XXX-#')}</w:t>
                    </w:r>
                </w:p>
            </w:tc>
        </w:tr>
        <!-- Fila 3: Área | Unidad | Revisión | Fecha -->
        <w:tr w:rsidR="00A87A6F" w:rsidTr="00A87A6F">
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="2275" w:type="dxa"/>
                    <w:tcBorders>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    </w:tcBorders>
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
                    <w:r>
                        <w:rPr>
                            <w:sz w:val="18"/>
                        </w:rPr>
                        <w:t>Área: ${escapeXML(documentData.headerConfig?.area || 'Área responsable')}</w:t>
                    </w:r>
                </w:p>
            </w:tc>
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="2275" w:type="dxa"/>
                    <w:tcBorders>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    </w:tcBorders>
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
                    <w:r>
                        <w:rPr>
                            <w:sz w:val="18"/>
                        </w:rPr>
                        <w:t>Unidad: ${escapeXML(documentData.headerConfig?.unidad || 'Unidad específica')}</w:t>
                    </w:r>
                </w:p>
            </w:tc>
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="2275" w:type="dxa"/>
                    <w:tcBorders>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    </w:tcBorders>
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F" w:rsidP="00A87A6F">
                    <w:pPr>
                        <w:jc w:val="center"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:sz w:val="18"/>
                        </w:rPr>
                        <w:t>Revisión: ${escapeXML(documentData.headerConfig?.revision || '(1)')}</w:t>
                    </w:r>
                </w:p>
            </w:tc>
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="2275" w:type="dxa"/>
                    <w:tcBorders>
                        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                    </w:tcBorders>
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F" w:rsidP="00A87A6F">
                    <w:pPr>
                        <w:jc w:val="right"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                            <w:sz w:val="18"/>
                        </w:rPr>
                        <w:t>Fecha: ${formattedDate}</w:t>
                    </w:r>
                </w:p>
            </w:tc>
        </w:tr>
    </w:tbl>
    <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F"/>
</w:hdr>`;
}

// Funciones para generar las secciones del documento
function generateObjectiveSection(content) {
    return `
    <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
        <w:pPr>
            <w:pStyle w:val="Heading1"/>
        </w:pPr>
        <w:r>
            <w:t>1. Objetivo o Propósito</w:t>
        </w:r>
    </w:p>
    ${formatContentXML(content || 'Contenido pendiente de completar.')}`;
}

function generateScopeSection(content) {
    return `
    <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
        <w:pPr>
            <w:pStyle w:val="Heading1"/>
        </w:pPr>
        <w:r>
            <w:t>2. Alcance</w:t>
        </w:r>
    </w:p>
    ${formatContentXML(content || 'Contenido pendiente de completar.')}`;
}

function generateResponsibilitiesSection(content) {
    return `
    <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
        <w:pPr>
            <w:pStyle w:val="Heading1"/>
        </w:pPr>
        <w:r>
            <w:t>3. Responsabilidades</w:t>
        </w:r>
    </w:p>
    ${formatContentXML(content || 'Contenido pendiente de completar.')}`;
}

function generateNormativaSection(content) {
    return `
    <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
        <w:pPr>
            <w:pStyle w:val="Heading1"/>
        </w:pPr>
        <w:r>
            <w:t>4. Normativa</w:t>
        </w:r>
    </w:p>
    ${formatContentXML(content || 'Contenido pendiente de completar.')}`;
}

function generateProcedureSection(procedureData) {
    return `
    <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
        <w:pPr>
            <w:pStyle w:val="Heading1"/>
        </w:pPr>
        <w:r>
            <w:t>5. Procedimiento</w:t>
        </w:r>
    </w:p>
    ${generateProcedureTableXML(procedureData)}`;
}

function generateAnexosSection(content) {
    return `
    <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
        <w:pPr>
            <w:pStyle w:val="Heading1"/>
        </w:pPr>
        <w:r>
            <w:t>6. Anexos</w:t>
        </w:r>
    </w:p>
    ${formatContentXML(content || 'Contenido pendiente de completar.')}`;
}

function generateTermsSection(content) {
    return `
    <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
        <w:pPr>
            <w:pStyle w:val="Heading1"/>
        </w:pPr>
        <w:r>
            <w:t>7. Términos y Referencias</w:t>
        </w:r>
    </w:p>
    ${formatContentXML(content || 'Contenido pendiente de completar.')}`;
}

// CORRECCIÓN: Función para escapar caracteres XML
function escapeXML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&apos;');
}

// CORRECCIÓN: Función para formatear contenido en XML
function formatContentXML(content) {
    if (!content) return '';
    
    const lines = content.split('\n');
    let formatted = '';
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') {
            formatted += `
    <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
        <w:r>
            <w:t xml:space="preserve"> </w:t>
        </w:r>
    </w:p>`;
        } else {
            formatted += `
    <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
        <w:r>
            <w:t xml:space="preserve">${escapeXML(trimmedLine)}</w:t>
        </w:r>
    </w:p>`;
        }
    });
    
    return formatted;
}

// CORRECCIÓN: Función para generar la tabla de procedimiento en XML
function generateProcedureTableXML(procedureData) {
    if (!procedureData || procedureData.length === 0) {
        return formatContentXML('Contenido pendiente de completar.');
    }

    let tableXML = `
    <w:tbl>
        <w:tblPr>
            <w:tblW w:w="0" w:type="auto"/>
            <w:tblBorders>
                <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
                <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
            </w:tblBorders>
            <w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" w:noHBand="0" w:noVBand="1"/>
        </w:tblPr>
        <w:tblGrid>
            <w:gridCol w:w="1700"/>
            <w:gridCol w:w="2800"/>
            <w:gridCol w:w="6800"/>
        </w:tblGrid>
        <w:tr w:rsidR="00A87A6F" w:rsidTr="00A87A6F">
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="1700" w:type="dxa"/>
                    <w:shd w:val="clear" w:color="auto" w:fill="D9D9D9"/>
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
                    <w:pPr>
                        <w:spacing w:before="0" w:after="0"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                        </w:rPr>
                        <w:t>(#)</w:t>
                    </w:r>
                </w:p>
            </w:tc>
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="2800" w:type="dxa"/>
                    <w:shd w:val="clear" w:color="auto" w:fill="D9D9D9"/>
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
                    <w:pPr>
                        <w:spacing w:before="0" w:after="0"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                        </w:rPr>
                        <w:t>(Quien)</w:t>
                    </w:r>
                </w:p>
            </w:tc>
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="6800" w:type="dxa"/>
                    <w:shd w:val="clear" w:color="auto" w:fill="D9D9D9"/>
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
                    <w:pPr>
                        <w:spacing w:before="0" w:after="0"/>
                    </w:pPr>
                    <w:r>
                        <w:rPr>
                            <w:b/>
                        </w:rPr>
                        <w:t>(Actividad)</w:t>
                    </w:r>
                </w:p>
            </w:tc>
        </w:tr>`;

    procedureData.forEach((row) => {
        let number = row.number || '';
        const who = row.who || '';
        const activity = row.activity || '';
        const level = row.level || '';

        // CORRECCIÓN: Manejar números simples y jerárquicos (ej. "4.1" -> "5.4.1"),
        // ahora aplicado independientemente del valor de 'level'
        if (number) {
            const trimmed = String(number).trim();

            // Si es un número simple (p.ej. "3"), agregar "5."
            if (!trimmed.includes('.') && !isNaN(trimmed)) {
                number = `5.${trimmed}`;
            } else {
                // Si es jerárquico (p.ej. "4.1" o "4.1.2") y no comienza con "5.",
                // validar que todos los segmentos sean numéricos y prefijar "5."
                if (!trimmed.startsWith('5.')) {
                    const segments = trimmed.split('.');
                    const allNumeric = segments.every(seg => /^\d+$/.test(seg));
                    if (allNumeric) {
                        number = `5.${trimmed}`;
                    } else {
                        // Si no es un patrón numérico esperado, mantener tal cual
                        number = trimmed;
                    }
                } else {
                    // Ya comienza con "5.", mantener
                    number = trimmed;
                }
            }
        }

        // Asegurar que number sea cadena antes de escapar
        number = String(number);

        tableXML += `
        <w:tr w:rsidR="00A87A6F" w:rsidTr="00A87A6F">
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="1700" w:type="dxa"/>
                    ${level === 'sub' ? '<w:shd w:val="clear" w:color="auto" w:fill="E8F5E8"/>' : ''}
                    ${level === 'section' ? '<w:shd w:val="clear" w:color="auto" w:fill="E3F2FD"/>' : ''}
                    ${level === 'question' ? '<w:shd w:val="clear" w:color="auto" w:fill="FFF3CD"/>' : ''}
                    ${level === 'alternative' ? '<w:shd w:val="clear" w:color="auto" w:fill="D1ECF1"/>' : ''}
                    ${level === 'end' ? '<w:shd w:val="clear" w:color="auto" w:fill="D4EDDA"/>' : ''}
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
                    <w:pPr>
                        <w:spacing w:before="0" w:after="0"/>
                        ${level === 'sub' ? '<w:ind w:left="200"/>' : ''}
                    </w:pPr>
                    <w:r>
                        <w:t>${escapeXML(number)}</w:t>
                    </w:r>
                </w:p>
            </w:tc>
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="2800" w:type="dxa"/>
                    ${level === 'sub' ? '<w:shd w:val="clear" w:color="auto" w:fill="E8F5E8"/>' : ''}
                    ${level === 'section' ? '<w:shd w:val="clear" w:color="auto" w:fill="E3F2FD"/>' : ''}
                    ${level === 'question' ? '<w:shd w:val="clear" w:color="auto" w:fill="FFF3CD"/>' : ''}
                    ${level === 'alternative' ? '<w:shd w:val="clear" w:color="auto" w:fill="D1ECF1"/>' : ''}
                    ${level === 'end' ? '<w:shd w:val="clear" w:color="auto" w:fill="D4EDDA"/>' : ''}
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
                    <w:pPr>
                        <w:spacing w:before="0" w:after="0"/>
                    </w:pPr>
                    <w:r>
                        <w:t>${escapeXML(who)}</w:t>
                    </w:r>
                </w:p>
            </w:tc>
            <w:tc>
                <w:tcPr>
                    <w:tcW w:w="6800" w:type="dxa"/>
                    ${level === 'sub' ? '<w:shd w:val="clear" w:color="auto" w:fill="E8F5E8"/>' : ''}
                    ${level === 'section' ? '<w:shd w:val="clear" w:color="auto" w:fill="E3F2FD"/>' : ''}
                    ${level === 'question' ? '<w:shd w:val="clear" w:color="auto" w:fill="FFF3CD"/>' : ''}
                    ${level === 'alternative' ? '<w:shd w:val="clear" w:color="auto" w:fill="D1ECF1"/>' : ''}
                    ${level === 'end' ? '<w:shd w:val="clear" w:color="auto" w:fill="D4EDDA"/>' : ''}
                </w:tcPr>
                <w:p w:rsidR="00A87A6F" w:rsidRDefault="00A87A6F">
                    <w:pPr>
                        <w:spacing w:before="0" w:after="0"/>
                    </w:pPr>
                    <w:r>
                        <w:t>${escapeXML(activity)}</w:t>
                    </w:r>
                </w:p>
            </w:tc>
        </w:tr>`;
    });

    tableXML += `
    </w:tbl>`;
    
    return tableXML;
}

// Funciones auxiliares para la estructura del documento .docx
function getContentTypes() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
    <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
    <Override PartName="/word/webSettings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml"/>
    <Override PartName="/word/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.theme+xml"/>
    <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
    <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
    <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
    <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
}

function getRels() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
}

function getDocumentRels() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>
    <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
    <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings" Target="webSettings.xml"/>
    <Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
</Relationships>`;
}

function getWebSettings() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:webSettings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:optimizeForBrowser/>
</w:webSettings>`;
}

function getAppProperties() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
    <Application>Microsoft Office Word</Application>
    <DocSecurity>0</DocSecurity>
    <ScaleCrop>false</ScaleCrop>
    <HeadingPairs>
        <vt:vector size="2" baseType="variant" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
            <vt:variant>
                <vt:lpstr>Títulos</vt:lpstr>
            </vt:variant>
            <vt:variant>
                <vt:i4>7</vt:i4>
            </vt:variant>
        </vt:vector>
    </HeadingPairs>
    <TitlesOfParts>
        <vt:vector size="7" baseType="lpstr" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
            <vt:lpstr>1. Objetivo o Propósito</vt:lpstr>
            <vt:lpstr>2. Alcance</vt:lpstr>
            <vt:lpstr>3. Responsabilidades</vt:lpstr>
            <vt:lpstr>4. Normativa</vt:lpstr>
            <vt:lpstr>5. Procedimiento</vt:lpstr>
            <vt:lpstr>6. Anexos</vt:lpstr>
            <vt:lpstr>7. Términos y Referencias</vt:lpstr>
        </vt:vector>
    </TitlesOfParts>
    <Company>Logo</Company>
    <LinksUpToDate>false</LinksUpToDate>
    <SharedDoc>false</SharedDoc>
    <HyperlinksChanged>false</HyperlinksChanged>
    <AppVersion>16.0000</AppVersion>
</Properties>`;
}

function getCoreProperties() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:dcmitype="http://purl.org/dc/dcmitype/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:creator>Sistema de Generación de Documentos</dc:creator>
    <cp:lastModifiedBy>Sistema de Generación de Documentos</cp:lastModifiedBy>
    <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
    <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`;
}

function getDocumentSettings() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:defaultTabStop w:val="720"/>
    <w:characterSpacingControl w:val="doNotCompress"/>
    <w:footnotePr>
        <w:footnote w:id="-1"/>
        <w:footnote w:id="0"/>
    </w:footnotePr>
    <w:endnotePr>
        <w:endnote w:id="0"/>
    </w:endnotePr>
    <w:compat/>
</w:settings>`;
}

function getDocumentStyles() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:docDefaults>
        <w:rPrDefault>
            <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
                <w:sz w:val="24"/>
                <w:szCs w:val="24"/>
                <w:lang w:val="es-ES" w:eastAsia="es-ES" w:bidi="ar-SA"/>
            </w:rPr>
        </w:rPrDefault>
        <w:pPrDefault>
            <w:pPr>
                <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>
            </w:pPr>
        </w:pPrDefault>
    </w:docDefaults>
    <w:style w:type="paragraph" w:styleId="Heading1">
        <w:name w:val="heading 1"/>
        <w:basedOn w:val="Normal"/>
        <w:next w:val="Normal"/>
        <w:link w:val="Heading1Char"/>
        <w:uiPriority w:val="9"/>
        <w:qFormat/>
        <w:rsid w:val="00A87A6F"/>
        <w:pPr>
            <w:keepNext/>
            <w:keepLines/>
            <w:spacing w:before="240" w:after="120"/>
            <w:outlineLvl w:val="0"/>
        </w:pPr>
        <w:rPr>
            <w:b/>
            <w:sz w:val="28"/>
        </w:rPr>
    </w:style>
    <w:style w:type="character" w:styleId="Heading1Char">
        <w:name w:val="Heading 1 Char"/>
        <w:basedOn w:val="DefaultParagraphFont"/>
        <w:link w:val="Heading1"/>
        <w:uiPriority w:val="9"/>
        <w:rsid w:val="00A87A6F"/>
        <w:rPr>
            <w:b/>
            <w:sz w:val="28"/>
        </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Normal">
        <w:name w:val="Normal"/>
        <w:qFormat/>
        <w:rsid w:val="00A87A6F"/>
        <w:pPr>
            <w:spacing w:after="120" w:line="276" w:lineRule="auto"/>
        </w:pPr>
        <w:rPr>
            <w:sz w:val="24"/>
            <w:szCs w:val="24"/>
        </w:rPr>
    </w:style>
</w:styles>`;
}

function getFontTable() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:font w:name="Times New Roman">
        <w:panose1 w:val="02020603050405020304"/>
        <w:charset w:val="00"/>
        <w:family w:val="roman"/>
        <w:pitch w:val="variable"/>
        <w:sig w:usb0="E0002AFF" w:usb1="C0007841" w:usb2="00000009" w:usb3="00000000" w:csb0="000001FF" w:csb1="00000000"/>
    </w:font>
</w:fonts>`;
}

function getTheme() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">
    <a:themeElements>
        <a:clrScheme name="Office">
            <a:dk1>
                <a:sysClr val="windowText" lastClr="000000"/>
            </a:dk1>
            <a:lt1>
                <a:sysClr val="window" lastClr="FFFFFF"/>
            </a:lt1>
            <a:dk2>
                <a:srgbClr val="1F497D"/>
            </a:dk2>
            <a:lt2>
                <a:srgbClr val="EEECE1"/>
            </a:lt2>
            <a:accent1>
                <a:srgbClr val="4F81BD"/>
            </a:accent1>
            <a:accent2>
                <a:srgbClr val="C0504D"/>
            </a:accent2>
            <a:accent3>
                <a:srgbClr val="9BBB59"/>
            </a:accent3>
            <a:accent4>
                <a:srgbClr val="8064A2"/>
            </a:accent4>
            <a:accent5>
                <a:srgbClr val="4BACC6"/>
            </a:accent5>
            <a:accent6>
                <a:srgbClr val="F79646"/>
            </a:accent6>
            <a:hlink>
                <a:srgbClr val="0000FF"/>
            </a:hlink>
            <a:folHlink>
                <a:srgbClr val="800080"/>
            </a:folHlink>
        </a:clrScheme>
        <a:fontScheme name="Office">
            <a:majorFont>
                <a:latin typeface="Cambria"/>
                <a:ea typeface=""/>
                <a:cs typeface=""/>
                <a:font script="Jpan" typeface="ＭＳ ゴシック"/>
                <a:font script="Hang" typeface="맑은 고딕"/>
                <a:font script="Hans" typeface="宋体"/>
                <a:font script="Hant" typeface="新細明體"/>
                <a:font script="Arab" typeface="Times New Roman"/>
                <a:font script="Hebr" typeface="Times New Roman"/>
                <a:font script="Thai" typeface="Angsana New"/>
                <a:font script="Ethi" typeface="Nyala"/>
                <a:font script="Beng" typeface="Vrinda"/>
                <a:font script="Gujr" typeface="Shruti"/>
                <a:font script="Khmr" typeface="MoolBoran"/>
                <a:font script="Knda" typeface="Tunga"/>
                <a:font script="Guru" typeface="Raavi"/>
                <a:font script="Cans" typeface="Euphemia"/>
                <a:font script="Cher" typeface="Plantagenet Cherokee"/>
                <a:font script="Yiii" typeface="Microsoft Yi Baiti"/>
                <a:font script="Tibt" typeface="Microsoft Himalaya"/>
                <a:font script="Thaa" typeface="MV Boli"/>
                <a:font script="Deva" typeface="Mangal"/>
                <a:font script="Telu" typeface="Gautami"/>
                <a:font script="Taml" typeface="Latha"/>
                <a:font script="Syrc" typeface="Estrangelo Edessa"/>
                <a:font script="Orya" typeface="Kalinga"/>
                <a:font script="Mlym" typeface="Kartika"/>
                <a:font script="Laoo" typeface="DokChampa"/>
                <a:font script="Sinh" typeface="Iskoola Pota"/>
                <a:font script="Mong" typeface="Mongolian Baiti"/>
                <a:font script="Viet" typeface="Times New Roman"/>
                <a:font script="Uigh" typeface="Microsoft Uighur"/>
                <a:font script="Geor" typeface="Sylfaen"/>
            </a:majorFont>
            <a:minorFont>
                <a:latin typeface="Calibri"/>
                <a:ea typeface=""/>
                <a:cs typeface=""/>
                <a:font script="Jpan" typeface="ＭＳ 明朝"/>
                <a:font script="Hang" typeface="맑은 고딕"/>
                <a:font script="Hans" typeface="宋体"/>
                <a:font script="Hant" typeface="新細明體"/>
                <a:font script="Arab" typeface="Arial"/>
                <a:font script="Hebr" typeface="Arial"/>
                <a:font script="Thai" typeface="Cordia New"/>
                <a:font script="Ethi" typeface="Nyala"/>
                <a:font script="Beng" typeface="Vrinda"/>
                <a:font script="Gujr" typeface="Shruti"/>
                <a:font script="Khmr" typeface="DaunPenh"/>
                <a:font script="Knda" typeface="Tunga"/>
                <a:font script="Guru" typeface="Raavi"/>
                <a:font script="Cans" typeface="Euphemia"/>
                <a:font script="Cher" typeface="Plantagenet Cherokee"/>
                <a:font script="Yiii" typeface="Microsoft Yi Baiti"/>
                <a:font script="Tibt" typeface="Microsoft Himalaya"/>
                <a:font script="Thaa" typeface="MV Boli"/>
                <a:font script="Deva" typeface="Mangal"/>
                <a:font script="Telu" typeface="Gautami"/>
                <a:font script="Taml" typeface="Latha"/>
                <a:font script="Syrc" typeface="Estrangelo Edessa"/>
                <a:font script="Orya" typeface="Kalinga"/>
                <a:font script="Mlym" typeface="Kartika"/>
                <a:font script="Laoo" typeface="DokChampa"/>
                <a:font script="Sinh" typeface="Iskoola Pota"/>
                <a:font script="Mong" typeface="Mongolian Baiti"/>
                <a:font script="Viet" typeface="Arial"/>
                <a:font script="Uigh" typeface="Microsoft Uighur"/>
                <a:font script="Geor" typeface="Sylfaen"/>
            </a:minorFont>
        </a:fontScheme>
        <a:fmtScheme name="Office">
            <a:fillStyleLst>
                <a:solidFill>
                    <a:schemeClr val="phClr"/>
                </a:solidFill>
                <a:gradFill rotWithShape="1">
                    <a:gsLst>
                        <a:gs pos="0">
                            <a:schemeClr val="phClr">
                                <a:lumMod val="110000"/>
                                <a:satMod val="105000"/>
                                <a:tint val="67000"/>
                            </a:schemeClr>
                        </a:gs>
                        <a:gs pos="50000">
                            <a:schemeClr val="phClr">
                                <a:lumMod val="105000"/>
                                <a:satMod val="103000"/>
                                <a:tint val="73000"/>
                            </a:schemeClr>
                        </a:gs>
                        <a:gs pos="100000">
                            <a:schemeClr val="phClr">
                                <a:lumMod val="105000"/>
                                <a:satMod val="109000"/>
                                <a:tint val="81000"/>
                            </a:schemeClr>
                        </a:gs>
                    </a:gsLst>
                    <a:lin ang="5400000" scaled="0"/>
                </a:gradFill>
                <a:gradFill rotWithShape="1">
                    <a:gsLst>
                        <a:gs pos="0">
                            <a:schemeClr val="phClr">
                                <a:satMod val="103000"/>
                                <a:lumMod val="102000"/>
                                <a:tint val="94000"/>
                            </a:schemeClr>
                        </a:gs>
                        <a:gs pos="50000">
                            <a:schemeClr val="phClr">
                                <a:satMod val="110000"/>
                                <a:lumMod val="100000"/>
                                <a:shade val="100000"/>
                            </a:schemeClr>
                        </a:gs>
                        <a:gs pos="100000">
                            <a:schemeClr val="phClr">
                                <a:lumMod val="99000"/>
                                <a:satMod val="120000"/>
                                <a:shade val="78000"/>
                            </a:schemeClr>
                        </a:gs>
                    </a:gsLst>
                    <a:lin ang="5400000" scaled="0"/>
                </a:gradFill>
            </a:fillStyleLst>
            <a:lnStyleLst>
                <a:ln w="6350" cap="flat" cmpd="sng" algn="ctr">
                    <a:solidFill>
                        <a:schemeClr val="phClr"/>
                    </a:solidFill>
                    <a:prstDash val="solid"/>
                    <a:miter lim="800000"/>
                </a:ln>
                <a:ln w="12700" cap="flat" cmpd="sng" algn="ctr">
                    <a:solidFill>
                        <a:schemeClr val="phClr"/>
                    </a:solidFill>
                    <a:prstDash val="solid"/>
                    <a:miter lim="800000"/>
                </a:ln>
                <a:ln w="19050" cap="flat" cmpd="sng" algn="ctr">
                    <a:solidFill>
                        <a:schemeClr val="phClr"/>
                    </a:solidFill>
                    <a:prstDash val="solid"/>
                    <a:miter lim="800000"/>
                </a:ln>
            </a:lnStyleLst>
            <a:effectStyleLst>
                <a:effectStyle>
                    <a:effectLst/>
                </a:effectStyle>
                <a:effectStyle>
                    <a:effectLst/>
                </a:effectStyle>
                <a:effectStyle>
                    <a:effectLst>
                        <a:outerShdw blurRad="57150" dist="19050" dir="5400000" algn="ctr" rotWithShape="0">
                            <a:srgbClr val="000000">
                                <a:alpha val="63000"/>
                            </a:srgbClr>
                        </a:outerShdw>
                    </a:effectLst>
                </a:effectStyle>
            </a:effectStyleLst>
            <a:bgFillStyleLst>
                <a:solidFill>
                    <a:schemeClr val="phClr"/>
                </a:solidFill>
                <a:solidFill>
                    <a:schemeClr val="phClr">
                        <a:tint val="95000"/>
                        <a:satMod val="170000"/>
                    </a:schemeClr>
                </a:solidFill>
                <a:gradFill rotWithShape="1">
                    <a:gsLst>
                        <a:gs pos="0">
                            <a:schemeClr val="phClr">
                                <a:tint val="93000"/>
                                <a:satMod val="150000"/>
                                <a:shade val="98000"/>
                                <a:lumMod val="103000"/>
                            </a:schemeClr>
                        </a:gs>
                        <a:gs pos="50000">
                            <a:schemeClr val="phClr">
                                <a:tint val="98000"/>
                                <a:satMod val="130000"/>
                                <a:shade val="90000"/>
                                <a:lumMod val="103000"/>
                            </a:schemeClr>
                        </a:gs>
                        <a:gs pos="100000">
                            <a:schemeClr val="phClr">
                                <a:shade val="63000"/>
                                <a:satMod val="120000"/>
                            </a:schemeClr>
                        </a:gs>
                    </a:gsLst>
                    <a:lin ang="5400000" scaled="0"/>
                </a:gradFill>
            </a:bgFillStyleLst>
        </a:fmtScheme>
    </a:themeElements>
    <a:objectDefaults/>
    <a:extraClrSchemeLst/>
</a:theme>`;
}