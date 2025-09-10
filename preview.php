<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

function formatDate($date) {
    return date('d.m.Y', strtotime($date));
}

function getTemplatePreview($templatePath, $replacements) {
    try {
        if (!file_exists($templatePath)) {
            return ['error' => 'Template file not found: ' . $templatePath];
        }
        
        // For .docx files, extract the content and convert to HTML
        if (pathinfo($templatePath, PATHINFO_EXTENSION) === 'docx') {
            $zip = new ZipArchive();
            $result = $zip->open($templatePath);
            if ($result === TRUE) {
                $documentXml = $zip->getFromName('word/document.xml');
                $stylesXml = $zip->getFromName('word/styles.xml');
                
                // Extract images and media
                $images = [];
                for ($i = 0; $i < $zip->numFiles; $i++) {
                    $filename = $zip->getNameIndex($i);
                    if (strpos($filename, 'word/media/') === 0) {
                        $imageData = $zip->getFromIndex($i);
                        $imageName = basename($filename);
                        $images[$imageName] = base64_encode($imageData);
                    }
                }
                
                $zip->close();
                
                if ($documentXml !== false) {
                    // Replace placeholders in the XML
                    foreach ($replacements as $placeholder => $value) {
                        // If value is empty or just the placeholder, mark as red
                        if (empty(trim($value)) || $value === $placeholder) {
                            // Just replace with a special marker that we'll color red in HTML later
                            $redPlaceholder = htmlspecialchars('RED_PLACEHOLDER:' . $placeholder, ENT_XML1, 'UTF-8');
                            $documentXml = str_replace($placeholder, $redPlaceholder, $documentXml);
                        } else {
                            // Mark user content as blue
                            $blueValue = 'BLUE_CONTENT:' . str_replace("\n", '\n', htmlspecialchars($value, ENT_XML1, 'UTF-8'));
                            $documentXml = str_replace($placeholder, $blueValue, $documentXml);
                        }
                    }
                    
                    // Convert Word XML to HTML for preview
                    $html = convertWordXmlToHtml($documentXml, $stylesXml, $images);
                    return ['html' => $html];
                } else {
                    return ['error' => 'Could not extract document.xml from template'];
                }
            } else {
                return ['error' => 'Could not open DOCX file. ZIP error code: ' . $result];
            }
        }
        
        return ['error' => 'Unsupported file format'];
    } catch (Exception $e) {
        return ['error' => 'Exception: ' . $e->getMessage()];
    }
}

function convertWordXmlToHtml($documentXml, $stylesXml = null, $images = []) {
    try {
        // Create a DOMDocument to parse the XML properly
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        $result = $dom->loadXML($documentXml);
        
        if (!$result) {
            $errors = libxml_get_errors();
            $errorMsg = 'XML parsing failed: ';
            foreach ($errors as $error) {
                $errorMsg .= $error->message . ' ';
            }
            libxml_clear_errors();
            return '<div style="color: red;">Error: ' . $errorMsg . '</div>';
        }
    
    // Extract all text runs and paragraphs with their formatting
    $html = '<div style="font-family: Times New Roman, serif; font-size: 12pt; line-height: 1.5; padding: 20px; background: white; max-width: 210mm; margin: 0 auto; min-height: 297mm; box-shadow: 0 0 10px rgba(0,0,0,0.1);">';
    
    $xpath = new DOMXPath($dom);
    
    // Register namespaces
    $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
    $xpath->registerNamespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships');
    
    // Get all paragraphs
    $paragraphs = $xpath->query('//w:p');
    
    foreach ($paragraphs as $paragraph) {
        $pStyle = '';
        $pContent = '';
        
        // Check for paragraph properties
        $pPr = $xpath->query('w:pPr', $paragraph);
        if ($pPr->length > 0) {
            $jc = $xpath->query('w:pPr/w:jc', $paragraph);
            if ($jc->length > 0) {
                $alignment = $jc->item(0)->getAttribute('w:val');
                switch ($alignment) {
                    case 'center':
                        $pStyle .= 'text-align: center; ';
                        break;
                    case 'right':
                        $pStyle .= 'text-align: right; ';
                        break;
                    case 'both':
                        $pStyle .= 'text-align: justify; ';
                        break;
                }
            }
            
            // Check for spacing
            $spacing = $xpath->query('w:pPr/w:spacing', $paragraph);
            if ($spacing->length > 0) {
                $after = $spacing->item(0)->getAttribute('w:after');
                if ($after) {
                    $pStyle .= 'margin-bottom: ' . ($after / 20) . 'pt; ';
                }
            }
        }
        
        // Get all runs in this paragraph
        $runs = $xpath->query('w:r', $paragraph);
        foreach ($runs as $run) {
            $runStyle = '';
            $runContent = '';
            
            // Check for run properties
            $rPr = $xpath->query('w:rPr', $run);
            if ($rPr->length > 0) {
                // Bold
                if ($xpath->query('w:rPr/w:b', $run)->length > 0) {
                    $runStyle .= 'font-weight: bold; ';
                }
                // Italic
                if ($xpath->query('w:rPr/w:i', $run)->length > 0) {
                    $runStyle .= 'font-style: italic; ';
                }
                // Underline
                if ($xpath->query('w:rPr/w:u', $run)->length > 0) {
                    $runStyle .= 'text-decoration: underline; ';
                }
                // Font size
                $sz = $xpath->query('w:rPr/w:sz', $run);
                if ($sz->length > 0) {
                    $fontSize = $sz->item(0)->getAttribute('w:val');
                    $runStyle .= 'font-size: ' . ($fontSize / 2) . 'pt; ';
                }
                // Color
                $color = $xpath->query('w:rPr/w:color', $run);
                if ($color->length > 0) {
                    $colorVal = $color->item(0)->getAttribute('w:val');
                    if ($colorVal) {
                        $runStyle .= 'color: #' . $colorVal . '; ';
                    }
                }
            }
            
            // Get text content
            $texts = $xpath->query('w:t', $run);
            foreach ($texts as $text) {
                $textContent = $text->nodeValue;
                // Check if this is a red placeholder
                if (strpos($textContent, 'RED_PLACEHOLDER:') === 0) {
                    $placeholder = substr($textContent, 16); // Remove "RED_PLACEHOLDER:" prefix
                    $runContent .= '<span style="color: red; font-weight: bold;">' . htmlspecialchars($placeholder) . '</span>';
                } 
                // Check if this is blue user content
                elseif (strpos($textContent, 'BLUE_CONTENT:') === 0) {
                    $userContent = substr($textContent, 13); // Remove "BLUE_CONTENT:" prefix
                    // Convert \n back to actual line breaks and then to HTML breaks
                    $userContent = str_replace('\n', "\n", $userContent);
                    $userContent = nl2br(htmlspecialchars($userContent));
                    $runContent .= '<span style="color: #0066cc; font-weight: 500;">' . $userContent . '</span>';
                } 
                else {
                    $runContent .= $textContent;
                }
            }
            
            // Handle line breaks
            $breaks = $xpath->query('w:br', $run);
            foreach ($breaks as $break) {
                $runContent .= '<br>';
            }
            
            // Handle images
            $drawings = $xpath->query('w:drawing', $run);
            foreach ($drawings as $drawing) {
                // This would need more complex handling for images
                $runContent .= '[IMAGE]';
            }
            
            if (!empty($runContent)) {
                if (!empty($runStyle)) {
                    $pContent .= '<span style="' . $runStyle . '">' . $runContent . '</span>';
                } else {
                    $pContent .= $runContent;
                }
            }
        }
        
        // Add paragraph to HTML
        if (!empty($pContent)) {
            $html .= '<p style="' . $pStyle . 'margin: 6pt 0;">' . $pContent . '</p>';
        } else {
            // Empty paragraph for spacing
            $html .= '<p style="' . $pStyle . 'margin: 6pt 0;">&nbsp;</p>';
        }
    }
    
    // Handle tables
    $tables = $xpath->query('//w:tbl');
    foreach ($tables as $table) {
        $html .= '<table style="width: 100%; border-collapse: collapse; margin: 10pt 0;">';
        $rows = $xpath->query('w:tr', $table);
        foreach ($rows as $row) {
            $html .= '<tr>';
            $cells = $xpath->query('w:tc', $row);
            foreach ($cells as $cell) {
                $cellContent = '';
                $cellParagraphs = $xpath->query('w:p', $cell);
                foreach ($cellParagraphs as $cellP) {
                    $cellRuns = $xpath->query('w:r', $cellP);
                    foreach ($cellRuns as $cellRun) {
                        $cellTexts = $xpath->query('w:t', $cellRun);
                        foreach ($cellTexts as $cellText) {
                            $cellContent .= $cellText->nodeValue;
                        }
                    }
                }
                $html .= '<td style="border: 1px solid #ccc; padding: 4pt; vertical-align: top;">' . $cellContent . '</td>';
            }
            $html .= '</tr>';
        }
        $html .= '</table>';
    }
    
    $html .= '</div>';
    return $html;
    } catch (Exception $e) {
        return '<div style="color: red;">Error converting document: ' . $e->getMessage() . '</div>';
    }
}

// Handle the preview request
if ($_POST) {
    $modelType = $_POST['model_type'] ?? '';
    
    if ($modelType === 'decizie') {
        $replacements = [
            '[NUMAR_DECIZIE]' => $_POST['numar_decizie'] ?? '[NUMĂR]',
            '[DATA_DECIZIE]' => isset($_POST['data_decizie']) ? formatDate($_POST['data_decizie']) : '[DATA]',
            '[NUMAR_REFERAT_APROBARE]' => $_POST['numar_referat_aprobare'] ?? '[NUMĂR REFERAT]',
            '[DATA_REFERAT_APROBARE]' => isset($_POST['data_referat_aprobare']) ? formatDate($_POST['data_referat_aprobare']) : '[DATA REFERAT]',
            '[INSPECTOR_GENERAL]' => $_POST['inspector_general'] ?? '[INSPECTOR GENERAL]',
            '[PRESEDINTE_COMISIE]' => $_POST['presedinte_comisie'] ?? '[PREȘEDINTE COMISIE]',
            '[MEMBRI_COMISIEI]' => $_POST['membrii_comisiei'] ?? '[MEMBRI COMISIEI]',
            '[INTOCMIT_DE]' => $_POST['intocmit_de'] ?? '[ÎNTOCMIT DE]',
            '[CONSILIER_JURIDIC]' => $_POST['consilier_juridic'] ?? '[CONSILIER JURIDIC]'
        ];
        
        $templatePath = 'templates/Model decizie.docx';
        
    } elseif ($modelType === 'referat') {
        $replacements = [
            '[NUMAR_REFERAT]' => $_POST['numar_referat'] ?? '[NUMĂR]',
            '[DATA_REFERAT]' => isset($_POST['data_referat']) ? formatDate($_POST['data_referat']) : '[DATA]',
            '[NUMELE_ELEVILOR]' => $_POST['numele_elevilor'] ?? '[LISTA ELEVI]',
            '[CLASA_ELEVILOR]' => $_POST['clasa_elevilor'] ?? '[CLASA]',
            '[UNITATEA_INVATAMANT]' => $_POST['unitatea_invatamant'] ?? '[UNITATEA DE ÎNVĂȚĂMÂNT]',
            '[MEMBRI_COMISIEI]' => $_POST['membrii_comisiei'] ?? '[MEMBRI COMISIEI]',
            '[APROBAT_DE]' => $_POST['aprobat_de'] ?? '[APROBAT DE]',
            '[INTOCMIT_DE]' => $_POST['intocmit_de'] ?? '[ÎNTOCMIT DE]'
        ];
        
        $templatePath = 'templates/model_referat_ucraineni.docx';
    } else {
        echo json_encode(['error' => 'Invalid model type']);
        exit;
    }
    
    $result = getTemplatePreview($templatePath, $replacements);
    echo json_encode($result);
} else {
    echo json_encode(['error' => 'No data provided']);
}
?>