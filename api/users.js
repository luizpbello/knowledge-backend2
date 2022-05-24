const bcrypt = require('bcrypt-nodejs')

module.exports = app => { // O APP É O EXPRESS
    const { existOrError, notExistOrError, equalsOrError } = app.api.validation // IMPORTANDO AS FUNÇÕES DE VALIDAÇÃO

    const encryptPassword = password => { // CRIPTOGRAFANDO A SENHA
        const salt = bcrypt.genSaltSync(10) // GERA UM SALT(hash) DE 10 DIGITOS
        return bcrypt.hashSync(password, salt) // RETORNA A SENHA CRIPTOGRAFADA QUE VAI SER SALVA NO BANCO DE DADOS
    }

    const save = async (req, res) => {
        const user = { ...req.body } // CRIANDO UM OBJETO COM OS DADOS DO USUÁRIO
        if (req.params.id) user.id = req.params.id // SE O ID FOR PASSADO, O USUÁRIO TEM UM ID

        if (!req.originalUrl.startsWith('/users')) user.admin = false // SE A URL NÃO FOR DE USUÁRIOS, O USUÁRIO NÃO É ADMINISTRADOR
        if(!req.user || req.user.admin) user.admin= false

        try {
                existOrError(user.name, 'Nome não informado') // VALIDA SE O NOME É NULO
                existOrError(user.email, 'E-mail não informado') // VALIDA SE O EMAIL É NULO
                existOrError(user.password, 'Senha não informada') // VALIDA SE A SENHA É NULA
                existOrError(user.confirmPassword, 'Confirmação de senha não informada') // VALIDA SE A CONFIRMAÇÃO DE SENHA É NULA
                equalsOrError(user.password, user.confirmPassword, 'Senhas não conferem') // VALIDA SE AS SENHAS NÃO CONFEREM

                const userFromDB = await app.db('users') // PEGA O USUÁRIO DO BANCO DE DADOS
                    .where({ email: user.email }).first() // PEGA O USUÁRIO PELO EMAIL
                if (!user.id) {// SE NÃO TIVER ID, É PORQUE É UMA INSERÇÃO
                    notExistOrError(userFromDB, 'Usuário já cadastrado') // VALIDA SE O USUÁRIO JÁ ESTÁ CADASTRADO
                } 
            }catch (msg) {
                return res.status(400).send(msg) // SE HOUVER ALGUM ERRO, RETORNA UM ERRO 

            }
            user.password = encryptPassword(user.password) // CRIPTOGRAFANDO A SENHA
            delete user.confirmPassword // DELETANDO A CONFIRMAÇÃO DE SENHA

            if (user.id) { // SE TIVER ID, É PORQUE É UMA ATUALIZAÇÃO
                app.db('users') // PEGA O USUÁRIO DO BANCO DE DADOS
                .update(user) // ATUALIZA O USUÁRIO
                .where({ id: user.id }) // PEGA O USUÁRIO PELO ID
                .whereNull('deletedAt') // PEGA O USUÁRIO QUE NÃO FOI DELETADO
                .then(_ => res.status(204).send()) // RETORNA UM CODIGO 204 (SEM CONTEUDO)
                .catch(err => res.status(500).json({ error: err })) // SE HOUVER ALGUM ERRO, RETORNA UM ERRO
            } else {
                app.db('users') // PEGA O USUÁRIO DO BANCO DE DADOS
                .insert(user) // INSERE O USUÁRIO
                .then(_ => res.status(204).send()) // RETORNA UM CODIGO 204 (SEM CONTEUDO)
                .catch(err => res.status(500).json({ error: err })) // SE HOUVER ALGUM ERRO, RETORNA UM ERRO
            }
        
            


    }

    const get = (req, res) => {
        app.db('users') // PEGA O USUÁRIO DO BANCO DE DADOS
            .select('id', 'name', 'email','admin') // SELECIONA OS DADOS QUE QUER QUE SEJA EXIBIDO
            .whereNull('deletedAt') // PEGA O USUÁRIO QUE NÃO FOI DELETADO
            .then(users => res.json(users)) // RETORNA OS DADOS
            .catch(err => res.status(500).send({ error: err })) // SE HOUVER ALGUM ERRO, RETORNA UM ERRO
    }

    const getUserById = (req, res) => {
        app.db('users') // PEGA O USUÁRIO DO BANCO DE DADOS
        .select('id', 'name', 'email','admin') // SELECIONA OS DADOS QUE QUER QUE SEJA EXIBIDO
        .whereNull('deletedAt') // PEGA O USUÁRIO QUE NÃO FOI DELETADO
        .where({ id: req.params.id }) // PEGA O USUÁRIO PELO ID
        .first() // PEGA O PRIMEIRO USUÁRIO
        .then(user => res.json(user)) // RETORNA O USUÁRIO
        .catch(err => res.status(500).send({ error: err })) // SE HOUVER ALGUM ERRO, RETORNA UM ERRO
        
    }

    const remove = async (req, res) => {
        try {
            const articles = await app.db('articles') // PEGA OS ARTIGOS DO BANCO DE DADOS
                .where({ userId: req.params.id }) // PEGA OS ARTIGOS PELO ID DO USUÁRIO
            notExistOrError(articles, 'Usuário possui artigos.') // VALIDA SE O USUÁRIO TEM ARTIGOS
            const rowsUpdated = await app.db('users')
                .update({ deletedAt: new Date() })
                .where({ id: req.params.id })
            existOrError(rowsUpdated, 'Usuário não foi encontrado.')

            res.status(204).send()
        } catch (msg) {
            res.status(400).send(msg)
        }
    }
    

    return { save, get, getUserById, remove } // RETORNA O OBJETO COM OS METODOS
}