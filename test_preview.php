<?php
// Simple test to debug the preview system

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Testing Preview System</h1>";

// Test if template file exists
$templatePath = 'templates/Model decizie.docx';
echo "<p>Template path: " . $templatePath . "</p>";
echo "<p>File exists: " . (file_exists($templatePath) ? 'YES' : 'NO') . "</p>";

if (file_exists($templatePath)) {
    echo "<p>File size: " . filesize($templatePath) . " bytes</p>";
}

// Test ZipArchive
if (class_exists('ZipArchive')) {
    echo "<p>ZipArchive class: AVAILABLE</p>";
    
    $zip = new ZipArchive();
    $result = $zip->open($templatePath);
    echo "<p>ZIP open result: " . $result . "</p>";
    
    if ($result === TRUE) {
        echo "<p>ZIP file opened successfully</p>";
        echo "<p>Number of files in ZIP: " . $zip->numFiles . "</p>";
        
        // List all files in the ZIP
        echo "<h3>Files in ZIP:</h3><ul>";
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $filename = $zip->getNameIndex($i);
            echo "<li>" . $filename . "</li>";
        }
        echo "</ul>";
        
        // Try to get document.xml
        $documentXml = $zip->getFromName('word/document.xml');
        if ($documentXml !== false) {
            echo "<p>document.xml extracted successfully</p>";
            echo "<p>Document XML size: " . strlen($documentXml) . " bytes</p>";
            echo "<p>First 500 characters:</p>";
            echo "<pre>" . htmlspecialchars(substr($documentXml, 0, 500)) . "</pre>";
        } else {
            echo "<p style='color:red;'>Failed to extract document.xml</p>";
        }
        
        $zip->close();
    } else {
        echo "<p style='color:red;'>Failed to open ZIP file. Error code: " . $result . "</p>";
    }
} else {
    echo "<p style='color:red;'>ZipArchive class: NOT AVAILABLE</p>";
}

echo "<h3>PHP Extensions:</h3>";
echo "<p>zip extension: " . (extension_loaded('zip') ? 'LOADED' : 'NOT LOADED') . "</p>";
echo "<p>libxml extension: " . (extension_loaded('libxml') ? 'LOADED' : 'NOT LOADED') . "</p>";
echo "<p>dom extension: " . (extension_loaded('dom') ? 'LOADED' : 'NOT LOADED') . "</p>";

?>