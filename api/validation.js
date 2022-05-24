//FUNÇÕES PARA VALIDAÇÃO DE DADOS
module.exports = app => {
    function existOrError(value, msg) { // VALIDA SE O CAMPO É NULO E RETORNA UM ERRO(MSG)
        if (!value) throw msg // SE O CAMPO FOR NULO, RETORNA A MSG
        if (Array.isArray(value) && value.length === 0) throw msg // SE O VALOR É UM ARRAY E TEM 0 ELEMENTOS, RETORNA UM ERRO
        if (typeof value === 'string' && !value.trim()) throw msg 
        // SE O VALOR É UMA STRING E ESTA VAZIA, RETORNA UM ERRO
    }
    
    function notExistOrError(value, msg) { // VALIDA SE O CAMPO É NULO E RETORNA UM ERRO(MSG)
        try {
            existOrError(value, msg) 
        } catch (msg) {
            return
        }
        throw msg // SE O CAMPO FOR NULO, RETORNA UM ERRO
    }
    
    function equalsOrError(valueA, valueB, msg) { // VALIDA SE O CAMPO É IGUAL AO OUTRO E RETORNA UM ERRO(MSG)
        if (valueA !== valueB) throw msg // SE O CAMPO FOR DIFERENTE DO OUTRO, RETORNA UM ERRO
    } 

    return { existOrError, notExistOrError, equalsOrError }
}

//OUTRAS FUNÇÕES DE VALIDAÇÃO
// VALIDAÇÕES DE EMAIL, SENHA, IDENTIFICADOR, NOME, ETC