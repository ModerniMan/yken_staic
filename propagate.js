const fs = require('fs');
const path = require('path');

// Active branches list
const branches = ['akko-nahariya', 'atlit', 'haifa', 'krayot', 'mechanic-test'];

// Paths to template files
const templateIndexPage = path.join(__dirname, '_template', 'index.html');
const templateStylePage = path.join(__dirname, '_template', 'css', 'style.css');
const templateAppJs = path.join(__dirname, '_template', 'js', 'app.js');

console.log('🚀 Starting propagation script...');

if (!fs.existsSync(templateIndexPage) || !fs.existsSync(templateStylePage) || !fs.existsSync(templateAppJs)) {
    console.error('❌ Template files missing! Check _template folder.');
    process.exit(1);
}

// Read templates
const indexTemplate = fs.readFileSync(templateIndexPage, 'utf8');
const styleTemplate = fs.readFileSync(templateStylePage, 'utf8');
const appTemplate = fs.readFileSync(templateAppJs, 'utf8');

branches.forEach(branch => {
    console.log(`\nProcessing branch: [${branch}]...`);
    const branchDir = path.join(__dirname, branch);
    const branchIndexPage = path.join(branchDir, 'index.html');
    
    if (!fs.existsSync(branchIndexPage)) {
        console.error(`⚠️ Branch directory or index.html not found for ${branch}. Skipping.`);
        return;
    }

    const branchIndexContent = fs.readFileSync(branchIndexPage, 'utf8');

    // 1. Extract branch specific values
    const nameMatch = branchIndexContent.match(/<title>מחולל ידידים\s*\|\s*סניף\s+(.*?)<\/title>/);
    const nicknameMatch = branchIndexContent.match(/<span class="header-subtitle" contenteditable="true">סיכום שבועי\s*\|\s*(.*?)<\/span>/);
    const bannerMatch = branchIndexContent.match(/background:\s*url\('(.*?)'\)/);
    
    // Extract first footer that is not "ידידים סניף ..."
    const footerMatches = [...branchIndexContent.matchAll(/<div class="card-footer">(.*?)<\/div>/g)];
    let footer = '';
    for (const match of footerMatches) {
        const text = match[1].trim();
        if (!text.startsWith('ידידים סניף')) {
            footer = text;
            break;
        }
    }

    if (!nameMatch || !nicknameMatch || !bannerMatch || !footer) {
        console.error(`❌ Failed to extract all variables for ${branch}.`);
        console.log(`- Name Match: ${nameMatch ? nameMatch[1] : 'FAILED'}`);
        console.log(`- Nickname Match: ${nicknameMatch ? nicknameMatch[1] : 'FAILED'}`);
        console.log(`- Banner Match: ${bannerMatch ? bannerMatch[1] : 'FAILED'}`);
        console.log(`- Footer extracted: ${footer ? footer : 'FAILED'}`);
        return;
    }

    const branchName = nameMatch[1].trim();
    const branchNickname = nicknameMatch[1].trim();
    const bannerImage = bannerMatch[1].trim();

    console.log(`✅ Extracted values:`);
    console.log(`   - Name: "${branchName}"`);
    console.log(`   - Nickname: "${branchNickname}"`);
    console.log(`   - Banner: "${bannerImage}"`);
    console.log(`   - Footer: "${footer}"`);

    // 2. Generate and write index.html
    let newIndex = indexTemplate
        .replace(/\{\{BRANCH_NAME\}\}/g, branchName)
        .replace(/\{\{BRANCH_NICKNAME\}\}/g, branchNickname)
        .replace(/\{\{BRANCH_FOOTER\}\}/g, footer)
        .replace(/\{\{BANNER_IMAGE\}\}/g, bannerImage);
    
    fs.writeFileSync(branchIndexPage, newIndex, 'utf8');
    console.log(`   📁 Written index.html`);

    // 3. Generate and write css/style.css
    const branchCssDir = path.join(branchDir, 'css');
    if (!fs.existsSync(branchCssDir)) {
        fs.mkdirSync(branchCssDir, { recursive: true });
    }
    const branchStylePage = path.join(branchCssDir, 'style.css');
    let newStyle = styleTemplate.replace(/\{\{BANNER_IMAGE\}\}/g, bannerImage);
    fs.writeFileSync(branchStylePage, newStyle, 'utf8');
    console.log(`   📁 Written css/style.css`);

    // 4. Copy js/app.js
    const branchJsDir = path.join(branchDir, 'js');
    if (!fs.existsSync(branchJsDir)) {
        fs.mkdirSync(branchJsDir, { recursive: true });
    }
    const branchAppJsPage = path.join(branchJsDir, 'app.js');
    fs.writeFileSync(branchAppJsPage, appTemplate, 'utf8');
    console.log(`   📁 Written js/app.js`);
});

console.log('\n🎉 Propagation complete for all branches!');
