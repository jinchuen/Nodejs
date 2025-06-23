const express = require('express')
const app = express()

const posts = [
    {
        username: 'Abing',
        title: 'Sup'
    },
    {
        username: 'Ahuang',
        title: 'huang'
    },    
]

app.get('/posts', (req, res) => {
    res.json(posts)
})

app.listen(3000)