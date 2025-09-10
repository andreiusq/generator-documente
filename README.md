# Generator Documente Minoritați - Electron App Setup

## Cerințe sistem
- Node.js 18+ 
- npm sau yarn
- Windows 10/11, macOS, sau Linux

## Instalare și rulare

### 1. Instalează dependențele
```bash
npm install
```

### 2. Rulează aplicația în modul dezvoltare
```bash
npm start
```

### 3. Construiește aplicația pentru distribuție

**Pentru Windows:**
```bash
npm run dist-win
```

**Pentru macOS:**
```bash
npm run dist-mac
```

**Pentru Linux:**
```bash
npm run dist-linux
```

## Structura proiectului

```
minoritati-generare/
├── electron/
│   ├── main.js              # Procesul principal Electron
│   ├── document-generator.js # Generator documente JS
│   └── assets/              # Iconuri aplicație
├── templates/               # Template-uri Word (.docx)
├── generated/              # Documente generate
├── index.html              # Pagina principală
├── form-decizie.html       # Formular decizie
├── form-referat.html       # Formular referat
└── package.json           # Configurație npm
```

## Funcționalități

### ✅ **Aplicație desktop standalone**
- Nu necesită browser web
- Interfață nativă pentru Windows/Mac/Linux
- Funcționează offline

### ✅ **Preview în timp real**
- Vizualizează documentul pe măsură ce completezi
- Câmpuri goale în roșu, completate în albastru
- Layout autentic Word

### ✅ **Generare documente**
- Folosește template-urile reale .docx
- Păstrează formatarea originală
- Generează .docx compatibile cu Word

### ✅ **Gestionare fișiere**
- Salvare automată în directorul `generated/`
- Deschidere directă în Word după generare
- Nume fișiere cu timestamp

## Template-uri necesare

Asigură-te că ai template-urile în directorul `templates/`:
- `Model decizie.docx` - cu placeholder-uri ca `[NUMAR_DECIZIE]`
- `model_referat_ucraineni.docx` - cu placeholder-uri ca `[NUMAR_REFERAT]`

## Placeholder-uri suportate

### Model Decizie:
- `[NUMAR_DECIZIE]`
- `[DATA_DECIZIE]` 
- `[NUMAR_REFERAT_APROBARE]`
- `[DATA_REFERAT_APROBARE]`
- `[INSPECTOR_GENERAL]`
- `[PRESEDINTE_COMISIE]`
- `[MEMBRI_COMISIEI]`
- `[CONSILIER_JURIDIC]`
- `[INTOCMIT_DE]`

### Model Referat:
- `[NUMAR_REFERAT]`
- `[DATA_REFERAT]`
- `[NUMELE_ELEVILOR]`
- `[CLASA_ELEVILOR]`
- `[UNITATEA_INVATAMANT]`
- `[MEMBRI_COMISIEI]`
- `[APROBAT_DE]`
- `[INTOCMIT_DE]`

## Probleme comune

### Aplicația nu pornește
- Verifică că Node.js este instalat: `node --version`
- Reinstalează dependențele: `rm -rf node_modules && npm install`

### Template-uri nu se încarcă
- Verifică că fișierele .docx sunt în `templates/`
- Asigură-te că au placeholder-urile corecte

### Documentele nu se generează
- Verifică permisiunile pe directorul `generated/`
- Asigură-te că template-urile nu sunt corupte

## Dezvoltare

Pentru dezvoltatori care vor să modifice aplicația:

1. **Modifică interfața**: Editează `index.html`, `form-decizie.html`, `form-referat.html`
2. **Modifică logica**: Editează `electron/document-generator.js`
3. **Testează**: `npm start`
4. **Construiește**: `npm run dist-win` (sau dist-mac/dist-linux)

## Powered by Starquess România