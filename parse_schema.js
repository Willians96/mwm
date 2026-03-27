const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('schema.json', 'utf8')).data.__schema;

schema.types.forEach(t => {
  if (t.fields) {
    t.fields.forEach(f => {
      if (f.name.toLowerCase().includes('price') || f.name.toLowerCase().includes('discount') || f.name.toLowerCase().includes('product')) {
        console.log(`Type: ${t.name} -> Field: ${f.name}`);
      }
    });
  }
});
