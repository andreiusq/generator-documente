const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const mammoth = require('mammoth');

class DocumentGenerator {
    constructor() {
        this.templatesPath = path.join(__dirname, '../templates');
        this.generatedPath = path.join(__dirname, '../generated');
        
        // Ensure generated directory exists
        if (!fs.existsSync(this.generatedPath)) {
            fs.mkdirSync(this.generatedPath, { recursive: true });
        }
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('ro-RO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    async generateDocument(templateType, formData) {
        try {
            let templatePath, outputName, replacements;

            if (templateType === 'decizie') {
                templatePath = path.join(this.templatesPath, 'Model decizie.docx');
                outputName = `Decizie_${formData.numar_decizie}_${new Date().toISOString().split('T')[0]}.docx`;
                
                // Format members list
                const membriArray = formData.membrii_comisiei.split('\n');
                const membriList = membriArray
                    .map((membru, index) => membru.trim() ? `${index + 1}. ${membru.trim()}` : '')
                    .filter(membru => membru)
                    .join('\n');

                replacements = {
                    '[NUMAR_DECIZIE]': formData.numar_decizie || '',
                    '[DATA_DECIZIE]': formData.data_decizie ? this.formatDate(formData.data_decizie) : '',
                    '[NUMAR_REFERAT_APROBARE]': formData.numar_referat_aprobare || '',
                    '[DATA_REFERAT_APROBARE]': formData.data_referat_aprobare ? this.formatDate(formData.data_referat_aprobare) : '',
                    '[INSPECTOR_GENERAL]': formData.inspector_general || '',
                    '[PRESEDINTE_COMISIE]': formData.presedinte_comisie || '',
                    '[MEMBRI_COMISIEI]': membriList,
                    '[INTOCMIT_DE]': formData.intocmit_de || '',
                    '[CONSILIER_JURIDIC]': formData.consilier_juridic || ''
                };

            } else if (templateType === 'referat') {
                templatePath = path.join(this.templatesPath, 'model_referat_ucraineni.docx');
                outputName = `Referat_Ucraineni_${formData.numar_referat}_${new Date().toISOString().split('T')[0]}.docx`;
                
                // Format students data as table rows
                const eleviArray = formData.numele_elevilor.split('\n');
                const cnpArray = formData.cnp_elevi.split('\n');
                
                // Handle new individual student data or fallback to old format
                const clasaArray = formData.clasa_elevilor ? formData.clasa_elevilor.split('\n') : [];
                const scoliArray = formData.scoli_dorite ? formData.scoli_dorite.split('\n') : [];
                
                // Create table rows for each student
                let tabelElevi = '';
                for (let i = 0; i < eleviArray.length; i++) {
                    const nume = eleviArray[i] ? eleviArray[i].trim() : '';
                    const cnp = cnpArray[i] ? cnpArray[i].trim() : '';
                    const clasa = clasaArray[i] ? clasaArray[i].trim() : (formData.clasa_elevilor || '');
                    const scoala = scoliArray[i] ? scoliArray[i].trim() : (formData.unitatea_invatamant || '');
                    
                    if (nume) {
                        // Tab-separated format for Word table: Nr. crt. | Nume | CNP | Clasa | Școala dorită
                        tabelElevi += `${i + 1}\t${nume}\t${cnp}\t${clasa}\t${scoala}\n`;
                    }
                }
                
                // Remove the last newline
                tabelElevi = tabelElevi.trim();

                // Also create individual placeholders for template compatibility
                const firstStudent = eleviArray[0] ? eleviArray[0].trim() : '';
                const firstCnp = cnpArray[0] ? cnpArray[0].trim() : '';
                const firstClasa = clasaArray[0] ? clasaArray[0].trim() : (formData.clasa_elevilor || '');
                const firstScoala = scoliArray[0] ? scoliArray[0].trim() : (formData.unitatea_invatamant || '');

                // Format members list
                const membriArray = formData.membrii_comisiei.split('\n');
                const membriList = membriArray
                    .map((membru, index) => membru.trim() ? `${index + 1}. ${membru.trim()}` : '')
                    .filter(membru => membru)
                    .join('\n');

                replacements = {
                    '[NUMAR_REFERAT]': formData.numar_referat || '',
                    '[DATA_REFERAT]': formData.data_referat ? this.formatDate(formData.data_referat) : '',
                    '[NUMELE_ELEVILOR]': tabelElevi,
                    '[CNP_ELEV]': firstCnp,
                    '[CLASA_ELEV]': firstClasa,
                    '[SCOALA_ELEV]': firstScoala,
                    '[NR_CRT]': '1',
                    '[CLASA_ELEVILOR]': formData.clasa_elevilor || '',
                    '[UNITATEA_INVATAMANT]': formData.unitatea_invatamant || '',
                    '[MEMBRI_COMISIEI]': membriList,
                    '[APROBAT_DE]': formData.aprobat_de || '',
                    '[INTOCMIT_DE]': formData.intocmit_de || ''
                };
            }

            const outputPath = await this.processTemplate(templatePath, outputName, replacements);
            return { success: true, filePath: outputPath, fileName: outputName };

        } catch (error) {
            console.error('Error generating document:', error);
            return { success: false, error: error.message };
        }
    }

    async processTemplate(templatePath, outputName, replacements) {
        const templateBuffer = fs.readFileSync(templatePath);
        const zip = await JSZip.loadAsync(templateBuffer);
        
        // Get document.xml
        const documentXml = await zip.file('word/document.xml').async('string');
        
        // Replace placeholders
        let modifiedXml = documentXml;
        
        // Special handling for student table data
        if (replacements['[NUMELE_ELEVILOR]'] && typeof replacements['[NUMELE_ELEVILOR]'] === 'string' && replacements['[NUMELE_ELEVILOR]'].includes('\t')) {
            modifiedXml = this.replaceStudentTableData(modifiedXml, replacements);
        } else {
            // Standard placeholder replacement
            for (const [placeholder, value] of Object.entries(replacements)) {
                const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const wordValue = value.replace(/\n/g, '</w:t><w:br/><w:t>');
                modifiedXml = modifiedXml.replace(new RegExp(escapedPlaceholder, 'g'), wordValue);
            }
        }
        
        // Update the document.xml in the zip
        zip.file('word/document.xml', modifiedXml);
        
        // Generate the modified document
        const outputBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        const outputPath = path.join(this.generatedPath, outputName);
        
        fs.writeFileSync(outputPath, outputBuffer);
        return outputPath;
    }

    replaceStudentTableData(documentXml, replacements) {
        const studentData = replacements['[NUMELE_ELEVILOR]'];
        const studentRows = studentData.split('\n').filter(row => row.trim());
        
        // Find the table row that contains the student placeholder
        const tableRowRegex = /<w:tr[^>]*>[\s\S]*?\[NUMELE_ELEVILOR\][\s\S]*?<\/w:tr>/;
        const tableRowMatch = documentXml.match(tableRowRegex);
        
        if (!tableRowMatch) {
            // Fallback to regular replacement if no table structure found
            return this.replaceRegularPlaceholders(documentXml, replacements);
        }
        
        const originalRow = tableRowMatch[0];
        let newRows = '';
        
        // Create a new table row for each student
        studentRows.forEach((studentRowData, index) => {
            const [nr, nume, cnp, clasa, scoala] = studentRowData.split('\t');
            
            let newRow = originalRow;
            
            // Replace placeholders in this row
            newRow = newRow.replace(/\[NUMELE_ELEVILOR\]/g, nume || '');
            newRow = newRow.replace(/\[CNP_ELEV\]/g, cnp || '');
            newRow = newRow.replace(/\[CLASA_ELEV\]/g, clasa || '');
            newRow = newRow.replace(/\[SCOALA_ELEV\]/g, scoala || '');
            newRow = newRow.replace(/\[NR_CRT\]/g, (index + 1).toString());
            
            newRows += newRow;
        });
        
        // Replace the original row with all new rows
        let modifiedXml = documentXml.replace(tableRowRegex, newRows);
        
        // Replace other placeholders normally
        for (const [placeholder, value] of Object.entries(replacements)) {
            if (placeholder !== '[NUMELE_ELEVILOR]') {
                const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const wordValue = value.replace(/\n/g, '</w:t><w:br/><w:t>');
                modifiedXml = modifiedXml.replace(new RegExp(escapedPlaceholder, 'g'), wordValue);
            }
        }
        
        return modifiedXml;
    }

    replaceRegularPlaceholders(documentXml, replacements) {
        let modifiedXml = documentXml;
        for (const [placeholder, value] of Object.entries(replacements)) {
            const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const wordValue = value.replace(/\n/g, '</w:t><w:br/><w:t>');
            modifiedXml = modifiedXml.replace(new RegExp(escapedPlaceholder, 'g'), wordValue);
        }
        return modifiedXml;
    }

    async getPreview(templateType, formData) {
        try {
            let templatePath, replacements;

            if (templateType === 'decizie') {
                templatePath = path.join(this.templatesPath, 'Model decizie.docx');
                
                const membriArray = formData.membrii_comisiei.split('\n');
                const membriList = membriArray
                    .map((membru, index) => membru.trim() ? `${index + 1}. ${membru.trim()}` : '')
                    .filter(membru => membru)
                    .join('\n');

                replacements = {
                    '[NUMAR_DECIZIE]': formData.numar_decizie || '[NUMĂR DECIZIE]',
                    '[DATA_DECIZIE]': formData.data_decizie ? this.formatDate(formData.data_decizie) : '[DATA]',
                    '[NUMAR_REFERAT_APROBARE]': formData.numar_referat_aprobare || '[NUMĂR REFERAT]',
                    '[DATA_REFERAT_APROBARE]': formData.data_referat_aprobare ? this.formatDate(formData.data_referat_aprobare) : '[DATA REFERAT]',
                    '[INSPECTOR_GENERAL]': formData.inspector_general || '[INSPECTOR GENERAL]',
                    '[PRESEDINTE_COMISIE]': formData.presedinte_comisie || '[PREȘEDINTE COMISIE]',
                    '[MEMBRI_COMISIEI]': membriList || '[MEMBRI COMISIEI]',
                    '[INTOCMIT_DE]': formData.intocmit_de || '[ÎNTOCMIT DE]',
                    '[CONSILIER_JURIDIC]': formData.consilier_juridic || '[CONSILIER JURIDIC]'
                };
            } else if (templateType === 'referat') {
                templatePath = path.join(this.templatesPath, 'model_referat_ucraineni.docx');
                
                const eleviArray = formData.numele_elevilor.split('\n');
                const cnpArray = formData.cnp_elevi.split('\n');
                
                // Handle new individual student data or fallback to old format
                const clasaArray = formData.clasa_elevilor ? formData.clasa_elevilor.split('\n') : [];
                const scoliArray = formData.scoli_dorite ? formData.scoli_dorite.split('\n') : [];
                
                // Create table rows for each student with proper tab separation
                let tabelElevi = '';
                for (let i = 0; i < eleviArray.length; i++) {
                    const nume = eleviArray[i] ? eleviArray[i].trim() : '';
                    const cnp = cnpArray[i] ? cnpArray[i].trim() : '';
                    const clasa = clasaArray[i] ? clasaArray[i].trim() : (formData.clasa_elevilor || '');
                    const scoala = scoliArray[i] ? scoliArray[i].trim() : (formData.unitatea_invatamant || '');
                    
                    if (nume) {
                        // Tab-separated format for Word table: Nr. crt. | Nume | CNP | Clasa | Școala dorită
                        tabelElevi += `${i + 1}\t${nume}\t${cnp}\t${clasa}\t${scoala}\n`;
                    }
                }
                
                // Remove the last newline
                tabelElevi = tabelElevi.trim();
                
                // Also create individual placeholders for template compatibility
                const firstStudent = eleviArray[0] ? eleviArray[0].trim() : '';
                const firstCnp = cnpArray[0] ? cnpArray[0].trim() : '';
                const firstClasa = clasaArray[0] ? clasaArray[0].trim() : (formData.clasa_elevilor || '');
                const firstScoala = scoliArray[0] ? scoliArray[0].trim() : (formData.unitatea_invatamant || '');

                const membriArray = formData.membrii_comisiei.split('\n');
                const membriList = membriArray
                    .map((membru, index) => membru.trim() ? `${index + 1}. ${membru.trim()}` : '')
                    .filter(membru => membru)
                    .join('\n');

                replacements = {
                    '[NUMAR_REFERAT]': formData.numar_referat || '[NUMĂR REFERAT]',
                    '[DATA_REFERAT]': formData.data_referat ? this.formatDate(formData.data_referat) : '[DATA]',
                    '[NUMELE_ELEVILOR]': tabelElevi || '[LISTA ELEVI]',
                    '[CNP_ELEV]': firstCnp || '[CNP ELEV]',
                    '[CLASA_ELEV]': firstClasa || '[CLASA ELEV]',
                    '[SCOALA_ELEV]': firstScoala || '[ȘCOALA ELEV]',
                    '[NR_CRT]': '1',
                    '[CLASA_ELEVILOR]': formData.clasa_elevilor || '[CLASA]',
                    '[UNITATEA_INVATAMANT]': formData.unitatea_invatamant || '[UNITATEA DE ÎNVĂȚĂMÂNT]',
                    '[MEMBRI_COMISIEI]': membriList || '[MEMBRI COMISIEI]',
                    '[APROBAT_DE]': formData.aprobat_de || '[APROBAT DE]',
                    '[INTOCMIT_DE]': formData.intocmit_de || '[ÎNTOCMIT DE]'
                };
            }

            const html = await this.convertToPreviewHTML(templatePath, replacements);
            return { success: true, html: html };

        } catch (error) {
            console.error('Error generating preview:', error);
            return { success: false, error: error.message };
        }
    }

    async convertToPreviewHTML(templatePath, replacements) {
        try {
            // Create a complete modified DOCX file with all parts (main document, headers, footers)
            const templateBuffer = fs.readFileSync(templatePath);
            const zip = await JSZip.loadAsync(templateBuffer);
            
            // Process main document
            const documentXml = await zip.file('word/document.xml').async('string');
            let modifiedDocumentXml = this.replacePlaceholdersInXml(documentXml, replacements);
            zip.file('word/document.xml', modifiedDocumentXml);
            
            // Debug: List all files in the DOCX
            console.log('Files in DOCX:', Object.keys(zip.files));
            
            // Process all headers with better detection
            let headerFound = false;
            const possibleHeaderFiles = ['word/header.xml', 'word/header1.xml', 'word/header2.xml', 'word/header3.xml'];
            for (const headerFile of possibleHeaderFiles) {
                const headerXml = zip.file(headerFile);
                if (headerXml) {
                    console.log('Found header:', headerFile);
                    const headerContent = await headerXml.async('string');
                    const modifiedHeaderXml = this.replacePlaceholdersInXml(headerContent, replacements);
                    zip.file(headerFile, modifiedHeaderXml);
                    headerFound = true;
                }
            }
            console.log('Headers found:', headerFound);
            
            // Process all footers with better detection
            let footerFound = false;
            const possibleFooterFiles = ['word/footer.xml', 'word/footer1.xml', 'word/footer2.xml', 'word/footer3.xml'];
            for (const footerFile of possibleFooterFiles) {
                const footerXml = zip.file(footerFile);
                if (footerXml) {
                    console.log('Found footer:', footerFile);
                    const footerContent = await footerXml.async('string');
                    const modifiedFooterXml = this.replacePlaceholdersInXml(footerContent, replacements);
                    zip.file(footerFile, modifiedFooterXml);
                    footerFound = true;
                }
            }
            console.log('Footers found:', footerFound);
            
            // Generate the complete modified DOCX
            const completeModifiedBuffer = await zip.generateAsync({ type: 'nodebuffer' });
            
            // Use Mammoth with enhanced options for better layout preservation
            const result = await mammoth.convertToHtml(
                { buffer: completeModifiedBuffer },
                {
                    styleMap: [
                        // Enhanced style mapping for better formatting
                        "p[style-name='Title'] => h1.document-title:fresh",
                        "p[style-name='Heading 1'] => h1.heading1:fresh",
                        "p[style-name='Heading 2'] => h2.heading2:fresh",
                        "p[style-name='Subtitle'] => h2.subtitle:fresh",
                        "p[style-name='Normal'] => p.normal:fresh",
                        "r[style-name='Strong'] => strong",
                        "r[style-name='Emphasis'] => em",
                        "p[style-name='Header'] => div.header",
                        "p[style-name='Footer'] => div.footer",
                        // Table styles
                        "table => table.doc-table",
                        "tr => tr.doc-row",
                        "td => td.doc-cell"
                    ],
                    includeDefaultStyleMap: true,
                    includeEmbeddedStyleMap: true,
                    convertImage: mammoth.images.imgElement(function(image) {
                        return image.read("base64").then(function(imageBuffer) {
                            return {
                                src: "data:" + image.contentType + ";base64," + imageBuffer
                            };
                        });
                    })
                }
            );
            
            let html = result.value;
            
            // Enhanced post-processing for better placeholder highlighting
            for (const [placeholder, value] of Object.entries(replacements)) {
                const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                if (value === placeholder || !value.trim()) {
                    // Enhanced red highlighting for empty placeholders
                    const regex = new RegExp(escapedPlaceholder, 'gi');
                    html = html.replace(regex, `<span class="empty-placeholder" style="
                        color: #dc2626; 
                        font-weight: bold; 
                        background-color: #fef2f2; 
                        padding: 3px 6px; 
                        border-radius: 4px;
                        border: 1px solid #fca5a5;
                        display: inline-block;
                        margin: 1px;
                    ">${placeholder}</span>`);
                } else {
                    // Special handling for table data (student list)
                    if (placeholder === '[NUMELE_ELEVILOR]' && value.includes('\t')) {
                        // Convert tab-separated data to HTML table
                        const tableRows = value.split('\n').filter(row => row.trim());
                        let tableHtml = `
                            <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
                                <thead>
                                    <tr style="background-color: #f3f4f6;">
                                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Nr. crt.</th>
                                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Numele și prenumele</th>
                                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">CNP</th>
                                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Clasa</th>
                                        <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Școala dorită</th>
                                    </tr>
                                </thead>
                                <tbody>`;
                        
                        tableRows.forEach(row => {
                            const [nr, nume, cnp, clasa, scoala] = row.split('\t');
                            tableHtml += `
                                <tr>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #0066cc; font-weight: 500;">${nr || ''}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #0066cc; font-weight: 500;">${nume || ''}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #0066cc; font-weight: 500;">${cnp || ''}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #0066cc; font-weight: 500;">${clasa || ''}</td>
                                    <td style="border: 1px solid #d1d5db; padding: 8px; color: #0066cc; font-weight: 500;">${scoala || ''}</td>
                                </tr>`;
                        });
                        
                        tableHtml += `
                                </tbody>
                            </table>`;
                        
                        html = html.replace(new RegExp(escapedPlaceholder, 'gi'), tableHtml);
                    } else {
                        // Enhanced blue highlighting for filled content
                        const valueLines = value.split('\n');
                        for (let i = 0; i < valueLines.length; i++) {
                            const line = valueLines[i].trim();
                            if (line && html.includes(line)) {
                                const regex = new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                                html = html.replace(regex, `<span class="filled-content" style="
                                    color: #0066cc; 
                                    font-weight: 500; 
                                    background-color: #eff6ff; 
                                    padding: 2px 4px; 
                                    border-radius: 3px;
                                    border: 1px solid #93c5fd;
                                    display: inline-block;
                                    margin: 1px;
                                ">${line}</span>`);
                            }
                        }
                    }
                }
            }
            
            // Debug: Check if we have all document parts
            console.log('Document processing complete');
            console.log('HTML length:', html.length);
            console.log('HTML sample:', html.substring(0, 200));
            
            // Create responsive document container  
            const styledHtml = `
                <div class="docx-preview" style="
                    font-family: 'Times New Roman', serif;
                    max-width: 100%;
                    width: auto;
                    min-height: 400px;
                    margin: 5px;
                    padding: 0;
                    background: white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    border: 1px solid #d1d5db;
                    position: relative;
                    overflow: visible;
                    font-size: 10px;
                ">
                    <style>
                        .docx-preview h1.document-title {
                            text-align: center;
                            font-size: 14px;
                            font-weight: bold;
                            margin: 12px 0 8px 0;
                            color: #1f2937;
                        }
                        .docx-preview h1.heading1 {
                            font-size: 12px;
                            font-weight: bold;
                            margin: 10px 0 4px 0;
                            color: #374151;
                        }
                        .docx-preview h2.heading2 {
                            font-size: 11px;
                            font-weight: bold;
                            margin: 8px 0 4px 0;
                            color: #4b5563;
                        }
                        .docx-preview p {
                            margin: 4px 0;
                            line-height: 1.2;
                            font-size: 10px;
                        }
                        .docx-preview p.normal {
                            margin: 4px 0;
                            line-height: 1.2;
                            text-align: justify;
                            font-size: 10px;
                        }
                        .docx-preview table.doc-table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 4px 0;
                            font-size: 9px;
                        }
                        .docx-preview table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 4px 0;
                            font-size: 9px;
                        }
                        .docx-preview td.doc-cell {
                            border: 1px solid #000;
                            padding: 2px 4px;
                            vertical-align: top;
                            font-size: 9px;
                        }
                        .docx-preview td {
                            border: 1px solid #000;
                            padding: 2px 4px;
                            vertical-align: top;
                            font-size: 9px;
                        }
                        .docx-preview strong {
                            font-weight: bold;
                        }
                        .docx-preview em {
                            font-style: italic;
                        }
                        /* Responsive text sizing */
                        @media (max-width: 768px) {
                            .docx-preview { font-size: 8px; }
                        }
                    </style>
                    
                    <div style="padding: 15px; line-height: 1.2; font-size: 10px;">
                        ${html}
                    </div>
                </div>
            `;
            
            return styledHtml;
            
        } catch (error) {
            console.error('Error converting DOCX to HTML:', error);
            return `<div style="color: red; padding: 20px; font-family: Arial, sans-serif;">
                <h3>Preview Error</h3>
                <p>Error loading document preview: ${error.message}</p>
                <p><small>Please check that your template file is a valid DOCX document.</small></p>
            </div>`;
        }
    }
    
    replacePlaceholdersInXml(xmlContent, replacements) {
        let modifiedXml = xmlContent;
        
        for (const [placeholder, value] of Object.entries(replacements)) {
            const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            if (value !== placeholder && value.trim()) {
                // Replace with actual value, preserving line breaks as Word XML
                const wordValue = value.replace(/\n/g, '</w:t><w:br/><w:t>');
                modifiedXml = modifiedXml.replace(new RegExp(escapedPlaceholder, 'g'), wordValue);
            }
            // If empty, leave placeholder as-is for coloring in post-processing
        }
        
        return modifiedXml;
    }

}

// Make it available globally for the renderer process
if (typeof window !== 'undefined') {
    window.DocumentGenerator = DocumentGenerator;
}

module.exports = DocumentGenerator;