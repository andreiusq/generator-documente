<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formular Model Decizie</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <div class="max-w-7xl mx-auto">
            <div class="mb-6 text-center">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Formular Model Decizie</h1>
                <p class="text-gray-600">Completează câmpurile și vezi preview-ul în timp real</p>
                <a href="index.php" class="text-blue-600 hover:text-blue-800 text-sm">&larr; Înapoi la selecție</a>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Preview Column -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-4">Preview Document</h2>
                    <div id="document-preview" class="bg-gray-50 p-4 rounded border min-h-96 font-serif text-sm leading-relaxed">
                        <div class="text-center mb-4">
                            <h3 class="text-lg font-bold">DECIZIE</h3>
                            <p>Nr. <span class="preview-numar-decizie text-blue-600">[NUMĂR]</span> din <span class="preview-data-decizie text-blue-600">[DATA]</span></p>
                        </div>
                        
                        <p class="mb-4">În baza referatului de aprobare nr. <span class="preview-numar-referat text-blue-600">[NUMĂR REFERAT]</span> din <span class="preview-data-referat text-blue-600">[DATA REFERAT]</span> și a numirii doamnei <span class="preview-inspector text-blue-600">[INSPECTOR GENERAL]</span>,</p>
                        
                        <p class="text-center font-bold mb-4">DECIDEM:</p>
                        
                        <p class="mb-4"><strong>Art. 1.</strong> Se constituie comisia de evaluare cu următoarea componență:</p>
                        
                        <p class="mb-2"><strong>Președinte:</strong></p>
                        <div class="preview-presedinte text-blue-600 mb-4 pl-4">[PREȘEDINTE COMISIE]</div>
                        
                        <p class="mb-2"><strong>Membri:</strong></p>
                        <div class="preview-membri text-blue-600 mb-4 pl-4">[MEMBRI COMISIEI]</div>
                        
                        <p class="mb-4"><strong>Art. 2.</strong> Comisia va îndeplini atribuțiile prevăzute în reglementările în vigoare.</p>
                        
                        <p class="mb-6"><strong>Art. 3.</strong> Prezenta decizie intră în vigoare la data semnării.</p>
                        
                        <div class="mt-8 grid grid-cols-2 gap-4">
                            <div>
                                <strong>Întocmit de:</strong><br>
                                <span class="preview-intocmit text-blue-600">[ÎNTOCMIT DE]</span>
                            </div>
                            <div class="text-right">
                                <strong>Consilier juridic:</strong><br>
                                <span class="preview-consilier text-blue-600">[CONSILIER JURIDIC]</span>
                            </div>
                        </div>
                        
                        <div class="text-right mt-4">
                            <strong>Aprobat:</strong><br>
                            INSPECTOR GENERAL
                        </div>
                    </div>
                </div>

                <!-- Form Column -->
                <div class="bg-white rounded-lg shadow-md p-6">

                <form action="generate.php" method="POST" class="space-y-6">
                    <input type="hidden" name="model_type" value="decizie">
                    
                    <div class="grid gap-6 md:grid-cols-2">
                        <!-- Numărul deciziei -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Numărul deciziei
                            </label>
                            <input type="text" name="numar_decizie" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ex: 123">
                        </div>

                        <!-- Data -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Data (zi/lună/an)
                            </label>
                            <input type="date" name="data_decizie" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>

                    <div class="grid gap-6 md:grid-cols-2">
                        <!-- Numărul referatului de aprobare -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Numărul referatului de aprobare
                            </label>
                            <input type="text" name="numar_referat_aprobare" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Ex: REF/456">
                        </div>

                        <!-- Data referatului de aprobare -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Data referatului de aprobare (zi.lună.an)
                            </label>
                            <input type="date" name="data_referat_aprobare" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                        </div>
                    </div>

                    <!-- Numirea doamnei inspector general -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Numirea doamnei inspector general (nr/zi.lună.an)
                        </label>
                        <input type="text" name="inspector_general" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Inspector General Maria Popescu (nr.789/12.05.2024)">
                    </div>

                    <!-- Președintele comisiei -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Președintele comisiei (nume + funcție)
                        </label>
                        <input type="text" name="presedinte_comisie" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Prof. Ion Ionescu - Director Școală">
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

                    <!-- Consileir juridic de -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Consilier juridic (Nume complet + funcție)
                        </label>
                        <input type="text" name="consilier_juridic" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Cons. juridic Andrei Mocanu">
                    </div>

                    <!-- Întocmit de -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Întocmit de (nume + funcție)
                        </label>
                        <input type="text" name="intocmit_de" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ex: Prof. Maria Georgescu - Inspector școlar">
                    </div>

                    <div class="flex gap-4 pt-4">
                        <button type="submit" 
                            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
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
                formData.append('model_type', 'decizie');
                formData.append('numar_decizie', document.querySelector('input[name="numar_decizie"]').value);
                formData.append('data_decizie', document.querySelector('input[name="data_decizie"]').value);
                formData.append('numar_referat_aprobare', document.querySelector('input[name="numar_referat_aprobare"]').value);
                formData.append('data_referat_aprobare', document.querySelector('input[name="data_referat_aprobare"]').value);
                formData.append('inspector_general', document.querySelector('input[name="inspector_general"]').value);
                formData.append('presedinte_comisie', document.querySelector('input[name="presedinte_comisie"]').value);
                formData.append('membrii_comisiei', document.querySelector('textarea[name="membrii_comisiei"]').value);
                formData.append('intocmit_de', document.querySelector('input[name="intocmit_de"]').value);
                formData.append('consilier_juridic', document.querySelector('input[name="consilier_juridic"]').value);
                
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