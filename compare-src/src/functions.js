import _ from "lodash"
import md5 from 'md5'


export function childrenPaths(parentPath, paths){
    return _.filter(paths, path => 
                        path.startsWith(parentPath) &&  
                        path.split('/').length - parentPath.split('/').length == 1
                    )
}

export function parentPath(path){
    return path.split('/').slice(0, -1).join('/')
}

export function colorHash(text, alpha){
    text = text.slice(14) // remove '--root path--/'
    const reverseString = text.split("").reverse().join("")
    const hash = md5(reverseString)
    const r = parseInt(hash.slice(12, 14), 16)
    const g = parseInt(hash.slice(14, 16), 16)
    const b = parseInt(hash.slice(16, 18), 16)
    return `rgb(${r}, ${g}, ${b}, 0.6)`
}

