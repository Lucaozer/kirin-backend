const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
// Permite que o seu front-end acesse este back-end
app.use(cors());
// Permite receber dados no formato JSON
app.use(express.json());

// 1. CONEXÃO COM O BANCO DE DADOS (Cria um arquivo kirin.db automaticamente)
const db = new sqlite3.Database('./kirin.db', (err) => {
    if (err) console.error('Erro ao abrir o banco:', err.message);
    else console.log('✅ Conectado ao banco de dados SQLite.');
});

// 2. CRIAR A TABELA DE PROFISSIONAIS (Se não existir)
db.run(`CREATE TABLE IF NOT EXISTS profissionais (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    categoria TEXT,
    cidade TEXT,
    bairro TEXT,
    telefone TEXT,
    descricao TEXT,
    tipo TEXT,
    cpf TEXT,
    statusCpf TEXT
)`);

// ==========================================
// ROTAS DA API (Endpoints)
// ==========================================

// ROTA 1: Ler todos os profissionais (Substitui o getItem do localStorage)
app.get('/api/profissionais', (req, res) => {
    db.all('SELECT * FROM profissionais ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(rows);
    });
});

// ROTA 2: Cadastrar um novo profissional (Substitui o setItem do localStorage)
app.post('/api/profissionais', (req, res) => {
    const { nome, categoria, cidade, bairro, telefone, descricao, tipo, cpf, statusCpf } = req.body;
    
    const query = `INSERT INTO profissionais (nome, categoria, cidade, bairro, telefone, descricao, tipo, cpf, statusCpf) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                   
    db.run(query, [nome, categoria, cidade, bairro, telefone, descricao, tipo, cpf, statusCpf], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Cadastrado com sucesso!', idGerado: this.lastID });
    });
});

// ROTA 3: Aprovar ou Reprovar CPF no Painel Admin
app.put('/api/profissionais/:id/status', (req, res) => {
    const { statusCpf } = req.body;
    const id = req.params.id;

    db.run(`UPDATE profissionais SET statusCpf = ? WHERE id = ?`, [statusCpf, id], function(err) {
        if (err) return res.status(500).json({ erro: err.message });
        res.json({ mensagem: 'Status atualizado com sucesso!' });
    });
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
    console.log('🚀 Servidor Kirin rodando em: http://localhost:3000');
});