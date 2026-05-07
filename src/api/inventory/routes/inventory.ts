
export default {
    routes: [
        {
            method:'GET',
            path:'/inventories/readlist',
            handler:'inventory.find',
            config: {
                auth:false,
            }
        },
        {
            method:'POST',
            path:'/inventories/addass',
            handler:'inventory.create',
            config: {
                auth:false,
            }
        }
    ]
}
