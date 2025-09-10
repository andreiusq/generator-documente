<?php
session_start();

if (!isset($_SESSION['generated_file']) || !file_exists($_SESSION['generated_file'])) {
    header('Location: index.php');
    exit();
}

$filename = $_SESSION['generated_file'];
$downloadName = basename($filename);

if (isset($_GET['download'])) {
    header('Content-Type: application/msword');
    header('Content-Disposition: attachment; filename="' . $downloadName . '"');
    header('Content-Length: ' . filesize($filename));
    readfile($filename);
    
    unlink($filename);
    unset($_SESSION['generated_file']);
    exit();
}
?>
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Generat</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
            <div class="bg-white rounded-lg shadow-md p-6 text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Document Generat cu Succes!</h1>
                <p class="text-gray-600 mb-6">Documentul a fost creat și este gata pentru descărcare.</p>
                
                <div class="space-y-4">
                    <a href="?download=1" 
                       class="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors inline-block">
                        <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Descarcă Document
                    </a>
                    
                    <div>
                        <a href="index.php" 
                           class="text-blue-600 hover:text-blue-800 transition-colors">
                            ← Generează alt document
                        </a>
                    </div>
                </div>
                
                <div class="mt-6 p-4 bg-blue-50 rounded-md">
                    <p class="text-sm text-blue-800">
                        <strong>Numele fișierului:</strong> <?php echo htmlspecialchars($downloadName); ?>
                    </p>
                    <p class="text-sm text-blue-600 mt-1">
                        Documentul va fi șters automat după descărcare.
                    </p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>