<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generator Documente Minorități</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-2xl mx-auto">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-4">Generator Documente Minoritați</h1>
                <p class="text-gray-600">Selectează tipul de document pe care dorești să-l generezi</p>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
                <!-- Model Decizie -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Model Decizie</h3>
                        <p class="text-gray-600 mb-4">Generează un document de decizie cu toate câmpurile necesare</p>
                        <a href="form_decizie.php" class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block">
                            Selectează
                        </a>
                    </div>
                </div>

                <!-- Model Referat Ucraineni -->
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div class="text-center">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Model Referat Ucraineni</h3>
                        <p class="text-gray-600 mb-4">Generează un referat pentru elevii ucraineni</p>
                        <a href="form_referat.php" class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors inline-block">
                            Selectează
                        </a>
                    </div>
                </div>
            </div>

            <div class="mt-8 text-center">
                <p class="text-sm text-gray-500">Documentele generate vor fi în format .docx</p>
                <p class="text-sm text-gray-500">Powered by <a href="https://starquess.ro" style="color: #0077ff;">Starquess România</a></p>
            </div>
        </div>
    </div>
</body>
</html>