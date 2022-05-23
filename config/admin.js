module.exports = middleware =>{
    return (req, res, next) => {
        if(req.user.admin){
            middleware(req, res, next) // se for admin, executa a função middleware
        }else{
            res.status(401).send({ error: 'Você não é admnistrador' })
        }
    }

}