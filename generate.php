<?php
session_start();

function formatDate($date) {
    return date('d.m.Y', strtotime($date));
}

function processTemplateDocument($templatePath, $outputFilename, $replacements) {
    if (!file_exists($templatePath)) {
        throw new Exception("Template file not found: " . $templatePath);
    }
    
    if (!file_exists('generated')) {
        mkdir('generated', 0777, true);
    }
    
    $outputPath = 'generated/' . $outputFilename;
    
    // Both templates are now .docx files
    return processDocxTemplate($templatePath, $outputPath, $replacements);
}

function processDocxTemplate($templatePath, $outputPath, $replacements) {
    // Copy template to output location
    copy($templatePath, $outputPath);
    
    // DOCX is a ZIP file - extract, modify, and repack
    $zip = new ZipArchive();
    if ($zip->open($outputPath) === TRUE) {
        // Get document.xml content
        $documentXml = $zip->getFromName('word/document.xml');
        
        if ($documentXml !== false) {
            // Replace placeholders
            foreach ($replacements as $placeholder => $value) {
                // Convert newlines to proper Word XML line breaks
                $wordValue = str_replace("\n", '</w:t><w:br/><w:t>', htmlspecialchars($value, ENT_XML1, 'UTF-8'));
                $documentXml = str_replace($placeholder, $wordValue, $documentXml);
            }
            
            // Put modified content back
            $zip->deleteName('word/document.xml');
            $zip->addFromString('word/document.xml', $documentXml);
        }
        
        $zip->close();
        return $outputPath;
    } else {
        throw new Exception("Could not open DOCX template");
    }
}


try {
    if ($_POST['model_type'] == 'decizie') {
        $numarDecizie = $_POST['numar_decizie'];
        $dataDecizie = formatDate($_POST['data_decizie']);
        $numarReferatAprobare = $_POST['numar_referat_aprobare'];
        $dataReferatAprobare = formatDate($_POST['data_referat_aprobare']);
        $inspectorGeneral = $_POST['inspector_general'];
        $presedinteComisie = $_POST['presedinte_comisie'];
        $membriComisiei = $_POST['membrii_comisiei'];
        $intocmitDe = $_POST['intocmit_de'];
        $consilierJuridic = $_POST['consilier_juridic'];
        
        // Format members list for Word document
        $membriArray = explode("\n", $membriComisiei);
        $membriList = '';
        foreach ($membriArray as $index => $membru) {
            $membru = trim($membru);
            if (!empty($membru)) {
                $membriList .= ($index + 1) . '. ' . $membru . "\n";
            }
        }
        
        // Define replacements for template placeholders
        $replacements = [
            '[NUMAR_DECIZIE]' => $numarDecizie,
            '[DATA_DECIZIE]' => $dataDecizie,
            '[NUMAR_REFERAT_APROBARE]' => $numarReferatAprobare,
            '[DATA_REFERAT_APROBARE]' => $dataReferatAprobare,
            '[INSPECTOR_GENERAL]' => $inspectorGeneral,
            '[PRESEDINTE_COMISIE]' => $presedinteComisie,
            '[MEMBRI_COMISIEI]' => trim($membriList),
            '[INTOCMIT_DE]' => $intocmitDe,
            '[CONSILIER_JURIDIC]' => $consilierJuridic
        ];
        
        $templatePath = 'templates/Model decizie.docx';
        $outputFilename = 'Decizie_' . $numarDecizie . '_' . date('Y-m-d') . '.docx';
        
        $filename = processTemplateDocument($templatePath, $outputFilename, $replacements);
        
    } else if ($_POST['model_type'] == 'referat') {
        $numarReferat = $_POST['numar_referat'];
        $dataReferat = formatDate($_POST['data_referat']);
        $numeElevi = $_POST['numele_elevilor'];
        $cnpElevi = $_POST['cnp_elevi'];
        $clasaElevilor = $_POST['clasa_elevilor'];
        $unitateaInvatamant = $_POST['unitatea_invatamant'];
        $membriComisiei = $_POST['membrii_comisiei'];
        $aprobatDe = $_POST['aprobat_de'];
        $intocmitDe = $_POST['intocmit_de'];
        
        // Format students data
        $eleviArray = explode("\n", $numeElevi);
        $cnpArray = explode("\n", $cnpElevi);
        
        $tabelElevi = '';
        for ($i = 0; $i < count($eleviArray); $i++) {
            $nume = trim($eleviArray[$i]);
            $cnp = isset($cnpArray[$i]) ? trim($cnpArray[$i]) : '';
            if (!empty($nume)) {
                $tabelElevi .= ($i + 1) . '. ' . $nume . ' - CNP: ' . $cnp . ' - Clasa: ' . $clasaElevilor . "\n";
            }
        }
        
        // Format members list
        $membriArray = explode("\n", $membriComisiei);
        $membriList = '';
        foreach ($membriArray as $index => $membru) {
            $membru = trim($membru);
            if (!empty($membru)) {
                $membriList .= ($index + 1) . '. ' . $membru . "\n";
            }
        }
        
        // Define replacements for template placeholders
        $replacements = [
            '[NUMAR_REFERAT]' => $numarReferat,
            '[DATA_REFERAT]' => $dataReferat,
            '[NUMELE_ELEVILOR]' => trim($tabelElevi),
            '[CLASA_ELEVILOR]' => $clasaElevilor,
            '[UNITATEA_INVATAMANT]' => $unitateaInvatamant,
            '[MEMBRI_COMISIEI]' => trim($membriList),
            '[APROBAT_DE]' => $aprobatDe,
            '[INTOCMIT_DE]' => $intocmitDe
        ];
        
        $templatePath = 'templates/model_referat_ucraineni.docx';
        $outputFilename = 'Referat_Ucraineni_' . $numarReferat . '_' . date('Y-m-d') . '.docx';
        
        $filename = processTemplateDocument($templatePath, $outputFilename, $replacements);
    }
} catch (Exception $e) {
    die("Eroare la generarea documentului: " . $e->getMessage());
}

if (isset($filename)) {
    $_SESSION['generated_file'] = $filename;
    header('Location: download.php');
    exit();
} else {
    echo "Eroare la generarea documentului!";
}
?>