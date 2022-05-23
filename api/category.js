module.exports = app => {
    const { existOrError, notExistOrError } = app.api.validation

    const save = (req, res) => {
        const category = {
            id: req.body.id,
            name: req.body.name,
            parentId: req.body.parentId
            
        }
        if(req.params.id) category.id = req.params.id

        try {
            existOrError(category.name, 'Nome não informado')
        }catch(msg){
            return res.status(400).send(msg)
        }

        if (category.id) {
            app.db('categories')
                .update(category)
                .where({ id: category.id })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        } else {
            app.db('categories')
                .insert(category)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        
        }

    }

    const remove = async (req, res) => {
        try{
            existOrError(req.params.id, 'Categoria não informada')
            const subcategory = await app.db('categories')
                .where({ parentId: req.params.id })

                notExistOrError(subcategory, 'Categoria possui subcategorias')

            const articles = await app.db('articles')
                .where({ categoryId: req.params.id })

                notExistOrError(articles, 'Categoria possui artigos')

            const rowsDeleted = await app.db('categories')
                .where({ id: req.params.id })
                .del()
                existOrError(rowsDeleted, 'Categoria não encontrada')


            res.status(204).send()
        }catch(msg){
            
            res.status(400).send(msg)
        }

    }

    const withPath = categories => { //FUNÇÃO PARA ADICIONAR O CAMPO PATH NA CATEGORIA
        const getParent = (categories, parentId) => {
            const parent = categories.filter(parent => parent.id === parentId) // FILTRANDO PELO PARENTID
            return parent.length ? parent[0] : null // SE TIVER PARENT, RETORNA O PRIMEIRO(UNICO), SE NÃO, RETORNA NULL
        }

        const categoriesWithPath = categories.map(category => { // MAP PARA ADICIONAR O CAMPO PATH
            let path = category.name
            let parent = getParent(categories, category.parentId)
            
            while(parent){
                path = `${parent.name} > ${path}`// ADICIONANDO O CAMPO PATH
                parent = getParent(categories, parent.parentId) // ATUALIZANDO O PARENT
            }

            return { ...category, path } // RETORNANDO O OBJETO COM O CAMPO PATH
        })

        categoriesWithPath.sort((a, b) => { // ORDENANDO PELO CAMPO PATH
            if (a.path < b.path) return -1
            if (a.path > b.path) return 1
            return 0
        }) 

        return categoriesWithPath
    }

    const get = (req, res) => {
        app.db('categories')
            .then(categories => res.json(withPath(categories)))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        app.db('categories')
            .where({ id: req.params.id })
            .first()
            .then(category => res.json(category))
            .catch(err => res.status(500).send(err))
    }

    const toTree = (categories, tree) =>{
        if(!tree) tree = categories.filter(c => !c.parentId) // FILTRANDO PELO PARENTID
        tree = tree.map(parentNode => {
            const isChild = node => node.parentId == parentNode.id
            parentNode.children = toTree(categories, categories.filter(isChild))
            return parentNode
    })
    return tree
}

    const getTree = (req, res) => {
        app.db('categories')
            .then(categories => res.json(toTree(categories)))
            .catch(err => res.status(500).send(err))
    }

    return { save, remove, get, getById, getTree }
}