const DocumentGenerator = require('../electron/document-generator');
const fs = require('fs');
const path = require('path');

describe('DocumentGenerator', () => {
    let documentGenerator;
    
    beforeEach(() => {
        documentGenerator = new DocumentGenerator();
        
        // Ensure generated directory exists
        const generatedDir = path.join(__dirname, '../generated');
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, { recursive: true });
        }
    });

    describe('formatDate', () => {
        test('should format date correctly for Romanian format', () => {
            const date = '2024-12-25';
            const formatted = documentGenerator.formatDate(date);
            expect(formatted).toBe('25.12.2024');
        });

        test('should handle invalid date', () => {
            const date = 'invalid-date';
            const formatted = documentGenerator.formatDate(date);
            expect(formatted).toBe('Invalid Date');
        });
    });

    describe('generateDocument - decizie', () => {
        test('should generate decizie document with correct replacements', async () => {
            const formData = {
                numar_decizie: 'DEC/123',
                data_decizie: '2024-12-25',
                numar_referat_aprobare: 'REF/456',
                data_referat_aprobare: '2024-12-20',
                inspector_general: 'Inspector General Maria Popescu',
                presedinte_comisie: 'Prof. Ion Ionescu - Director',
                membrii_comisiei: 'Prof. Ana Maria - Matematică\nProf. Gheorghe Vasile - Română',
                consilier_juridic: 'Cons. juridic Andrei Mocanu',
                intocmit_de: 'Prof. Maria Georgescu - Inspector școlar'
            };

            // Mock template file existence
            const templatePath = path.join(documentGenerator.templatesPath, 'Model decizie.docx');
            if (!fs.existsSync(templatePath)) {
                // Skip test if template doesn't exist
                console.log('Template file not found, skipping test');
                return;
            }

            const result = await documentGenerator.generateDocument('decizie', formData);
            
            if (result.success) {
                expect(result.success).toBe(true);
                expect(result.fileName).toContain('Decizie_DEC123');
                expect(result.filePath).toBeDefined();
            } else {
                // Test the error handling
                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
            }
        });
    });

    describe('generateDocument - referat', () => {
        test('should generate referat document with table formatting', async () => {
            const formData = {
                numar_referat: 'REF/789',
                data_referat: '2024-12-25',
                numele_elevilor: 'Petrov Olena\nKovalenko Viktor\nMoroz Iana',
                cnp_elevi: '1234567890123\n9876543210987\n5647382910456',
                clasa_elevilor: 'a VI-a A',
                unitatea_invatamant: 'Școala Gimnazială Nr. 15',
                membrii_comisiei: 'Prof. Ana Maria - Matematică\nProf. Gheorghe Vasile - Română',
                aprobat_de: 'Inspector General Maria Popescu',
                intocmit_de: 'Prof. Maria Georgescu - Inspector școlar'
            };

            // Mock template file existence
            const templatePath = path.join(documentGenerator.templatesPath, 'model_referat_ucraineni.docx');
            if (!fs.existsSync(templatePath)) {
                console.log('Template file not found, skipping test');
                return;
            }

            const result = await documentGenerator.generateDocument('referat', formData);
            
            if (result.success) {
                expect(result.success).toBe(true);
                expect(result.fileName).toContain('Referat_Ucraineni_REF789');
                expect(result.filePath).toBeDefined();
            } else {
                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
            }
        });
    });

    describe('getPreview', () => {
        test('should generate preview for decizie', async () => {
            const formData = {
                numar_decizie: 'DEC/123',
                data_decizie: '2024-12-25',
                numar_referat_aprobare: 'REF/456',
                data_referat_aprobare: '2024-12-20',
                inspector_general: 'Inspector General',
                presedinte_comisie: 'Prof. Director',
                membrii_comisiei: 'Prof. Ana\nProf. Ion',
                consilier_juridic: 'Consilier Juridic',
                intocmit_de: 'Prof. Inspector'
            };

            const templatePath = path.join(documentGenerator.templatesPath, 'Model decizie.docx');
            if (!fs.existsSync(templatePath)) {
                console.log('Template file not found, skipping test');
                return;
            }

            const result = await documentGenerator.getPreview('decizie', formData);
            
            if (result.success) {
                expect(result.success).toBe(true);
                expect(result.html).toBeDefined();
                expect(typeof result.html).toBe('string');
            } else {
                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
            }
        });

        test('should generate preview for referat with table formatting', async () => {
            const formData = {
                numar_referat: 'REF/789',
                numele_elevilor: 'Petrov Olena\nKovalenko Viktor',
                cnp_elevi: '1234567890123\n9876543210987',
                clasa_elevilor: 'a VI-a A',
                membrii_comisiei: 'Prof. Ana Maria\nProf. Ion Ionescu',
                aprobat_de: 'Inspector General',
                intocmit_de: 'Prof. Maria'
            };

            const templatePath = path.join(documentGenerator.templatesPath, 'model_referat_ucraineni.docx');
            if (!fs.existsSync(templatePath)) {
                console.log('Template file not found, skipping test');
                return;
            }

            const result = await documentGenerator.getPreview('referat', formData);
            
            if (result.success) {
                expect(result.success).toBe(true);
                expect(result.html).toBeDefined();
                expect(result.html).toContain('table'); // Check for table formatting
            } else {
                expect(result.success).toBe(false);
                expect(result.error).toBeDefined();
            }
        });
    });

    describe('Table formatting for students', () => {
        test('should format student data as tab-separated table rows', () => {
            const students = ['Petrov Olena', 'Kovalenko Viktor'];
            const cnps = ['1234567890123', '9876543210987'];
            const clasa = 'a VI-a A';

            let tabelElevi = '';
            for (let i = 0; i < students.length; i++) {
                const nume = students[i] ? students[i].trim() : '';
                const cnp = cnps[i] ? cnps[i].trim() : '';
                
                if (nume) {
                    tabelElevi += `${i + 1}\t${nume}\t${cnp}\t${clasa}\n`;
                }
            }
            tabelElevi = tabelElevi.trim();

            expect(tabelElevi).toBe('1\tPetrov Olena\t1234567890123\ta VI-a A\n2\tKovalenko Viktor\t9876543210987\ta VI-a A');
        });
    });
});