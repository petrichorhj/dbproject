import request from '@/utils/request'

// 获取笔记列表
export function getNoteList() {
    return request({
        url: '/api/note/list',
        method: 'get'
    })
}

// 笔记详情
export function getNoteDetail(id) {
    return request({
        url: '/api/note/detail',
        method: 'get',
        params: { id }
    })
}

// 保存 / 新建笔记
export function saveNote(data) {
    return request({
        url: '/api/note/save',
        method: 'post',
        data
    })
}

// 删除到回收站
export function deleteNote(data) {
    return request({
        url: '/api/note/delete',
        method: 'post',
        data
    })
}

// 回收站列表
export function getTrashList() {
    return request({
        url: '/api/note/trash',
        method: 'get'
    })
}

// 恢复笔记
export function recoverNote(data) {
    return request({
        url: '/api/note/recover',
        method: 'post',
        data
    })
}

// 永久删除笔记
export function destroyNote(data) {
    return request({
        url: '/api/note/destroy',
        method: 'post',
        data
    })
}

// ===================== 笔记本接口 =====================
export function listNotebook() {
    return request({
        url: '/api/notebook/list',
        method: 'get'
    })
}

export function addNotebook(data) {
    return request({
        url: '/api/notebook/add',
        method: 'post',
        data
    })
}

export function delNotebook(data) {
    return request({
        url: '/api/notebook/del',
        method: 'post',
        data
    })
}