const fs = require('fs');
const path = require('path');

const dataFile = path.join(process.cwd(), 'audit_data.json');

// Create initial data file if it doesn't exist
if (!fs.existsSync(dataFile)) {
  const initialData = {
    audits: [],
    nextId: 1,
  };
  fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
  console.log('✓ Database initialized at:', dataFile);
} else {
  console.log('✓ Database already exists at:', dataFile);
}
