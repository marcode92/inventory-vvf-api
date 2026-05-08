
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
            method:'GET',
            path:'/inventories/readoneass',
            handler:'inventory.findOne',
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
