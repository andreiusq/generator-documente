<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formular Model Referat Ucraineni</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-7xl mx-auto">
            <div class="mb-6 text-center">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Formular Model Referat Ucraineni</h1>
                <p class="text-gray-600">Completează câmpurile și vezi preview-ul în timp real</p>
                <a href="index.php" class="text-blue-600 hover:text-blue-800 text-sm">&larr; Înapoi la selecție</a>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Preview Column -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Preview Document</h2>
                    <div id="document-preview" class="bg-gray-50 p-4 rounded border min-h-96 font-serif text-sm leading-relaxed">
                        <div class="text-center mb-4">
                            <h3 class="text-lg font-bold">REFERAT</h3>
                            <p>Nr. <span class="preview-numar-referat text-blue-600">[NUMĂR]</span> din <span class="preview-data-referat text-blue-600">[DATA]</span></p>
                        </div>
                        
                        <p class="mb-4"><strong>Către:</strong> <span class="preview-aprobat text-blue-600">[APROBAT DE]</span></p>
                        
                        <p class="mb-4"><strong>Obiect:</strong> Evaluarea elevilor ucraineni</p>
                        
                        <p class="mb-4">Prin prezentul referat, vă informez despre situația următorilor elevi ucraineni din <span class="preview-unitate text-blue-600">[UNITATEA DE ÎNVĂȚĂMÂNT]</span>:</p>
                        
                        <div class="mb-4">
                            <strong>Elevii:</strong>
                            <div class="preview-elevi text-blue-600 pl-4 mt-2">[LISTA ELEVI]</div>
                        </div>
                        
                        <div class="mb-4">
                            <strong>Comisia de evaluare:</strong>
                            <div class="preview-membri text-blue-600 pl-4 mt-2">[MEMBRI COMISIEI]</div>
                        </div>
                        
                        <p class="mb-6">Solicit aprobarea pentru continuarea procesului de evaluare conform normelor în vigoare.</p>
                        
                        <div class="mt-8 grid grid-cols-2 gap-4">
                            <div>
                                <strong>Întocmit de:</strong><br>
                                <span class="preview-intocmit text-blue-600">[ÎNTOCMIT DE]</span>
                            </div>
                            <div class="text-right">
                                <strong>Aprobat:</strong><br>
                                <span class="preview-aprobat-copy text-blue-600">[APROBAT DE]</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Column -->
                <div class="bg-white rounded-lg shadow-md p-6">

                <form action="generate.php" method="POST" class="space-y-6">
                    <input type="hidden" name="model_type" value="referat">
                    
                    <div class="grid gap-6 md:grid-cols-2">
                        <!-- Număr referat -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Număr referat
                            </label>
                            <input type="text" name="numar_referat" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ex: REF/789">
                        </div>

                        <!-- Data referatului -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Data referatului (zi.lună.an)
                            </label>
                            <input type="date" name="data_referat" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>

                    <!-- Numele și prenumele elevilor -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Numele și prenumele elevilor
                        </label>
                        <textarea name="numele_elevilor" rows="4" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: &#10;Petrov Olena&#10;Kovalenko Viktor&#10;Moroz Iana"></textarea>
                        <p class="text-sm text-gray-500 mt-1">Introduceți câte un elev pe linie</p>
                    </div>

                    <!-- CNP elevi -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            CNP elevi
                        </label>
                        <textarea name="cnp_elevi" rows="4" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: &#10;1234567890123&#10;9876543210987&#10;5647382910456"></textarea>
                        <p class="text-sm text-gray-500 mt-1">Introduceți câte un CNP pe linie, în aceeași ordine ca numele</p>
                    </div>

                    <div class="grid gap-6 md:grid-cols-2">
                        <!-- Clasa elevilor -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Clasa elevilor
                            </label>
                            <input type="text" name="clasa_elevilor" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ex: a VI-a A">
                        </div>

                        <!-- Unitatea de învățământ -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Unitatea de învățământ
                            </label>
                            <input type="text" name="unitatea_invatamant" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ex: Școala Gimnazială Nr. 15">
                        </div>
                    </div>

                    <!-- Membrii comisiei -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Membrii comisiei (lista profesorilor)
                        </label>
                        <textarea name="membrii_comisiei" rows="4" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: &#10;Prof. Ana Maria - Matematică&#10;Prof. Gheorghe Vasile - Română&#10;Prof. Elena Popa - Engleză"></textarea>
                        <p class="text-sm text-gray-500 mt-1">Introduceți câte un profesor pe linie</p>
                    </div>

                    <!-- Aprobat de -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Aprobat de (inspector general)
                        </label>
                        <input type="text" name="aprobat_de" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Inspector General Maria Popescu">
                    </div>

                    <!-- Întocmit de -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Întocmit de
                        </label>
                        <input type="text" name="intocmit_de" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Prof. Maria Georgescu - Inspector școlar">
                    </div>

                    <div class="flex gap-4 pt-4">
                        <button type="submit" 
                            class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
                            Generează Document
                        </button>
                        <a href="index.php" 
                            class="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors">
                            Anulează
                        </a>
                    </div>
                </form>
                </div>
            </div>
        </div>
    </div>

    <script>
        let updateTimeout;
        
        // Live preview functionality using real template
        function updatePreview() {
            // Clear existing timeout
            if (updateTimeout) {
                clearTimeout(updateTimeout);
            }
            
            // Add a small delay to avoid too many requests while typing
            updateTimeout = setTimeout(() => {
                const formData = new FormData();
                formData.append('model_type', 'referat');
                formData.append('numar_referat', document.querySelector('input[name="numar_referat"]').value);
                formData.append('data_referat', document.querySelector('input[name="data_referat"]').value);
                formData.append('numele_elevilor', document.querySelector('textarea[name="numele_elevilor"]').value);
                formData.append('cnp_elevi', document.querySelector('textarea[name="cnp_elevi"]').value);
                formData.append('clasa_elevilor', document.querySelector('input[name="clasa_elevilor"]').value);
                formData.append('unitatea_invatamant', document.querySelector('input[name="unitatea_invatamant"]').value);
                formData.append('membrii_comisiei', document.querySelector('textarea[name="membrii_comisiei"]').value);
                formData.append('aprobat_de', document.querySelector('input[name="aprobat_de"]').value);
                formData.append('intocmit_de', document.querySelector('input[name="intocmit_de"]').value);
                
                fetch('preview.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    const previewDiv = document.getElementById('document-preview');
                    if (data.html) {
                        previewDiv.innerHTML = data.html;
                    } else if (data.error) {
                        previewDiv.innerHTML = '<div class="text-red-600">Error: ' + data.error + '</div>';
                    }
                })
                .catch(error => {
                    console.error('Preview error:', error);
                    document.getElementById('document-preview').innerHTML = '<div class="text-red-600">Error loading preview</div>';
                });
            }, 300); // 300ms delay
        }

        // Add event listeners to all form inputs
        document.addEventListener('DOMContentLoaded', function() {
            const inputs = document.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('input', updatePreview);
                input.addEventListener('change', updatePreview);
            });
            
            // Initial preview update
            updatePreview();
        });
    </script>
</body>
</html>