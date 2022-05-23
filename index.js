const app = require('express')()
const consign = require('consign')
const db = require('./config/db') // IMPORTANDO CONFIGURAÇÃO DE CONEXÃO COM O BANCO DE DADOS
const mongoose = require('mongoose')
const cors = require('cors')

require('./config/mongodb')

app.use(cors())
app.db = db // ATRIBUINDO O KNEX CONIGURADO NA VARIÁVEL DB PARA USO NO APP(EXPRESS)
app.mongoose = mongoose // ATRIBUINDO O MONGOOSE CONIGURADO NA VARIÁVEL DB PARA USO NO APP(EXPRESS)
consign() // CHAMANDO O CONSIGN || PARA CADA THEN DO CONSIGN, ELE CARREGA O ARQUIVO JS REFERENCIADO
    .include('./config/passport.js') // IMPORTANDO O PASSPORT.JS
    .then('config/middlewares.js') //O CONSIGN VAI PASSAR OS PARAMETROS PARA O MIDDLEWARES.JS E UTILIZAR ELE NO 'APP' QUE É O EXPRESS
    .then('api/validation.js')
    .then('./api')
    .then('./schedule')
    .then('./config/routes.js')
    .into(app) 

app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor rodando na porta 3000')
})