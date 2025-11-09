export function generateWordDocument(documentData, procedureData) {
    // Obtener fecha actual o usar la proporcionada
    const today = documentData.headerConfig?.fecha ? 
        new Date(documentData.headerConfig.fecha) : new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day} -${month} -${year}`;
    
    // Crear contenido con encabezado profesional EN TABLA como en la imagen
    let htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
    <meta charset="UTF-8">
    <title>${documentData.headerConfig?.policyName || 'POLÍTICA O PROCEDIMIENTO DE PAGO A PROVEEDORES'}</title>
    <!--[if gte mso 9]>
    <xml>
        <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
        /* Estilos IDÉNTICOS al documento original */
        body {
            font-family: "Times New Roman", serif;
            margin: 1.5cm 2cm 2cm 2cm;
            line-height: 1.2;
            font-size: 12pt;
            color: #000000;
        }
        
        /* Encabezado profesional EN TABLA como en la imagen */
        .header-table {
            width: 100%;
            border: 2px solid #000000;
            border-collapse: collapse;
            margin-bottom: 25px;
            font-family: "Arial", sans-serif;
            font-size: 10pt;
            page-break-after: avoid;
        }
        
        .header-table td {
            padding: 8px 10px;
            vertical-align: middle;
        }
        
        .logo-cell {
            font-weight: bold;
            font-size: 11pt;
            width: 33%;
            text-align: left;
        }
        
        .manual-cell {
            font-weight: bold;
            font-size: 11pt;
            width: 34%;
            text-align: center;
        }
        
        .page-cell {
            font-weight: bold;
            font-size: 11pt;
            width: 33%;
            text-align: right;
        }
        
        .title-cell {
            font-size: 14pt;
            font-weight: bold;
            text-transform: uppercase;
            text-align: left;
            padding: 12px 10px;
            width: 70%;
        }
        
        .code-cell {
            font-size: 10pt;
            font-weight: bold;
            text-align: right;
            padding: 12px 10px;
            width: 30%;
        }
        
        .area-cell {
            font-size: 9pt;
            text-align: left;
            padding: 8px 10px;
            width: 25%;
            border-top: 1px solid #000000;
        }
        
        .unit-cell {
            font-size: 9pt;
            text-align: left;
            padding: 8px 10px;
            width: 25%;
            border-top: 1px solid #000000;
        }
        
        .revision-cell {
            font-size: 9pt;
            text-align: center;
            padding: 8px 10px;
            width: 25%;
            border-top: 1px solid #000000;
        }
        
        .date-cell {
            font-size: 9pt;
            text-align: right;
            padding: 8px 10px;
            width: 25%;
            border-top: 1px solid #000000;
        }
        
        /* Estilos para títulos de sección IDÉNTICOS al original */
        h1.Estilo1 {
            font-size: 14pt;
            font-weight: bold;
            color: #000000;
            margin-bottom: 12pt;
            margin-top: 18pt;
            border-bottom: 1px solid #000000;
            padding-bottom: 3pt;
            font-family: "Times New Roman", serif;
            page-break-after: avoid;
        }
        
        .Estilo1 {
            font-family: "Times New Roman", serif;
            font-size: 12pt;
            line-height: 1.2;
            text-align: justify;
        }
        
        .underline {
            text-decoration: underline;
        }
        
        /* Estilos para tablas IDÉNTICOS al original */
        table.procedimiento {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000000;
            margin: 12pt 0;
            font-size: 10pt;
            font-family: "Times New Roman", serif;
            page-break-inside: avoid;
        }
        
        table.procedimiento td {
            border: 1px solid #000000;
            padding: 4pt 6pt;
            vertical-align: top;
            text-align: left;
        }
        
        table.procedimiento th {
            border: 1px solid #000000;
            padding: 4pt 6pt;
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
        }
        
        .seccion-titulo {
            font-weight: bold;
            background-color: #e3f2fd;
        }
        
        .subseccion-titulo {
            font-weight: bold;
            background-color: #f3e5f5;
        }
        
        /* Estilos para listas IDÉNTICOS al original */
        ol, ul {
            margin: 6pt 0;
            padding-left: 24pt;
        }
        
        li {
            margin-bottom: 3pt;
            text-align: justify;
        }
        
        /* Estilos para elementos específicos del formato original */
        .normativa-roman {
            list-style-type: upper-roman;
            font-weight: bold;
        }
        
        .normativa-decimal {
            list-style-type: decimal;
        }
        
        .normativa-alpha {
            list-style-type: lower-alpha;
            margin-left: 24pt;
        }
        
        .nota {
            margin-top: 18pt;
            font-style: italic;
            border-top: 1px solid #000000;
            padding-top: 6pt;
            font-size: 10pt;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        /* Control de saltos de página para Word */
        @media print {
            .header-table {
                page-break-after: avoid;
            }
            
            h1.Estilo1 {
                page-break-after: avoid;
            }
            
            table.procedimiento {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <!-- Encabezado profesional EN TABLA como en la imagen -->
    <table class="header-table" cellspacing="0" cellpadding="0">
        <!-- Primera fila: Logo | Manual | Página -->
        <tr>
            <td class="logo-cell">
                Logo
            </td>
            <td class="manual-cell">
                ${documentData.headerConfig?.manualName || 'Manual de Políticas y Procedimientos'}
            </td>
            <td class="page-cell">
                Página 1 de 3
            </td>
        </tr>
        
        <!-- Segunda fila: Título | Código -->
        <tr>
            <td class="title-cell" colspan="2">
                POLÍTICA O PROCEDIMIENTO DE ${documentData.headerConfig?.policyName || 'PAGO A PROVEEDORES'}
            </td>
            <td class="code-cell">
                CÓDIGO: ${documentData.headerConfig?.codigo || 'XX-P-XXX-#'}
            </td>
        </tr>
        
        <!-- Tercera fila: Área | Unidad | Revisión | Fecha -->
        <tr>
            <td class="area-cell">
                <strong>Área:</strong> ${documentData.headerConfig?.area || 'Logística'}
            </td>
            <td class="unit-cell">
                <strong>Unidad:</strong> ${documentData.headerConfig?.unidad || 'Compras'}
            </td>
            <td class="revision-cell">
                <strong>Revisión:</strong> ${documentData.headerConfig?.revision || '(1)'}
            </td>
            <td class="date-cell">
                <strong>Fecha:</strong> ${formattedDate}
            </td>
        </tr>
    </table>

    <h1 class="Estilo1" id="objetivo-o-proposito">1. Objetivo o Propósito</h1>
    <div class="Estilo1">
        ${formatContent(documentData.objetivo)}
    </div>

    <h1 class="Estilo1" id="alcance">2. Alcance</h1>
    <div class="Estilo1">
        ${formatContent(documentData.alcance)}
    </div>

    <h1 class="Estilo1" id="responsabilidades">3. Responsabilidades</h1>
    <div class="Estilo1">
        ${formatContent(documentData.responsabilidades)}
    </div>

    <h1 class="Estilo1" id="normativa">4. Normativa</h1>
    <div class="Estilo1">
        ${formatNormativa(documentData.normativa)}
    </div>

    <h1 class="Estilo1" id="procedimiento">5. Procedimiento</h1>
    <div class="Estilo1">
        ${generateProcedureTable(procedureData)}
    </div>

    <h1 class="Estilo1" id="anexos">6. Anexos</h1>
    <div class="Estilo1">
        ${formatContent(documentData.anexos)}
    </div>

    <h1 class="Estilo1" id="terminos">7. Términos y Referencias</h1>
    <div class="Estilo1">
        ${formatContent(documentData.terminos)}
    </div>

    <div class="nota Estilo1">
        <strong>Nota:</strong> ${formatContent(documentData.nota || 'Documento generado mediante sistema de gestión documental.')}
    </div>
</body>
</html>`;

    // Descargar el archivo
    const blob = new Blob([htmlContent], { 
        type: 'application/msword' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentData.headerConfig?.policyName || 'Pago_Proveedores'}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
}

// Función para formatear contenido manteniendo saltos de línea
function formatContent(content) {
    if (!content) return '<p>Contenido pendiente de completar.</p>';
    
    const lines = content.split('\n');
    let formatted = '';
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '') {
            formatted += '<p>&nbsp;</p>';
        } else {
            // Preservar el formato de listas simples
            if (/^\d+\./.test(trimmedLine) || /^[a-zA-Z]\./.test(trimmedLine)) {
                formatted += `<p style="margin-left: 20px;">${trimmedLine}</p>`;
            } else {
                formatted += `<p>${trimmedLine}</p>`;
            }
        }
    });
    
    return formatted;
}

// Función especial para formatear la normativa con números romanos
function formatNormativa(content) {
    if (!content) return '<p>Contenido pendiente de completar.</p>';
    
    const lines = content.split('\n');
    let formatted = '';
    let inRomanList = false;
    let inDecimalList = false;
    let inAlphaList = false;

    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine === '') {
            if (inAlphaList) {
                formatted += '</ol>';
                inAlphaList = false;
            }
            if (inDecimalList) {
                formatted += '</ol>';
                inDecimalList = false;
            }
            if (inRomanList) {
                formatted += '</ol>';
                inRomanList = false;
            }
            formatted += '<p>&nbsp;</p>';
            return;
        }

        // Detectar listas con números romanos (I., II., etc.)
        if (/^[IVX]+\./.test(trimmedLine)) {
            if (!inRomanList) {
                formatted += '<ol class="normativa-roman">';
                inRomanList = true;
            }
            const text = trimmedLine.replace(/^[IVX]+\.\s*/, '');
            formatted += `<li>${text}</li>`;
        }
        // Detectar listas decimales (1), 2), etc.)
        else if (/^\d+\)/.test(trimmedLine)) {
            if (inRomanList) {
                formatted += '</ol>';
                inRomanList = false;
            }
            if (!inDecimalList) {
                formatted += '<ol class="normativa-decimal">';
                inDecimalList = true;
            }
            const text = trimmedLine.replace(/^\d+\)\s*/, '');
            formatted += `<li>${text}</li>`;
        }
        // Detectar listas alfabéticas (a., b., etc.)
        else if (/^[a-f]\./.test(trimmedLine)) {
            if (inDecimalList) {
                if (!inAlphaList) {
                    formatted += '<ol class="normativa-alpha">';
                    inAlphaList = true;
                }
                const text = trimmedLine.replace(/^[a-f]\.\s*/, '');
                formatted += `<li>${text}</li>`;
            } else {
                formatted += `<p>${trimmedLine}</p>`;
            }
        }
        // Texto con subrayado entre corchetes
        else if (trimmedLine.includes('[') && trimmedLine.includes(']')) {
            const underlined = trimmedLine.replace(/\[(.*?)\]/g, '<span class="underline">$1</span>');
            formatted += `<p>${underlined}</p>`;
        }
        // Texto normal
        else {
            // Cerrar listas si estamos saliendo de ellas
            if (inAlphaList) {
                formatted += '</ol>';
                inAlphaList = false;
            }
            if (inDecimalList) {
                formatted += '</ol>';
                inDecimalList = false;
            }
            if (inRomanList) {
                formatted += '</ol>';
                inRomanList = false;
            }
            formatted += `<p>${trimmedLine}</p>`;
        }
    });

    // Cerrar cualquier lista que quede abierta
    if (inAlphaList) formatted += '</ol>';
    if (inDecimalList) formatted += '</ol>';
    if (inRomanList) formatted += '</ol>';

    return formatted;
}

// Función para generar la tabla de procedimiento
function generateProcedureTable(procedureData) {
    if (!procedureData || procedureData.length === 0) {
        return '<p>Contenido pendiente de completar.</p>';
    }

    let tableHTML = `
<table class="procedimiento" cellspacing="0" cellpadding="4">
    <thead>
        <tr>
            <th width="15%">(#)</th>
            <th width="25%">(Quien)</th>
            <th width="60%">(Actividad)</th>
        </tr>
    </thead>
    <tbody>`;

    procedureData.forEach(row => {
        const number = row.number || '';
        const who = row.who || '';
        const activity = row.activity || '';
        
        // Si es una fila de sección (solo tiene actividad y las otras están vacías)
        if (!number && !who && activity) {
            tableHTML += `
        <tr>
            <td colspan="3" class="seccion-titulo">${activity}</td>
        </tr>`;
        }
        // Si es una fila de subsección (solo tiene número y actividad)
        else if (number && !who && activity) {
            tableHTML += `
        <tr>
            <td><strong>${number}</strong></td>
            <td></td>
            <td class="subseccion-titulo">${activity}</td>
        </tr>`;
        }
        // Si es una fila normal con todas las columnas
        else if (number || who || activity) {
            tableHTML += `
        <tr>
            <td>${number}</td>
            <td>${who}</td>
            <td>${activity}</td>
        </tr>`;
        }
        // Fila vacía para separación
        else {
            tableHTML += `
        <tr>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
        </tr>`;
        }
    });

    tableHTML += `
    </tbody>
</table>`;

    return tableHTML;
}