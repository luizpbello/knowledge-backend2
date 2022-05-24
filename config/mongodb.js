const mongoose = require('mongoose')



mongoose.connect('mongodb+srv://knowledge:2611rs@cluster0.f5y3n.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .catch (e => {
        const msg = 'ERRO: Não foi possível conectar ao MongoDB!'
        console.log('\x1b[41m%s\x1b[37m', msg, '\x1b[0m')
    })
