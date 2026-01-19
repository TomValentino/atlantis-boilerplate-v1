export const db = {
    store: {
        store_handle: "my-store",
        shopify_storefront_token: "xxx",
        webhook_url: "to revalidate the paths?",
        default_product_template: "minimal",
    },
    overlays: [
        {
            component: "slider_cart_overlay",
            element_id: 324534554,
            props: {
                zIndex: 100,
                loading_children: [
                    { 
                        element_id: 54545445,
                        component: "title",
                        props: {
                            text: "Loading cart"
                        }
                    }
                ]
            },
            children: [
                {
                    element_id: 234,
                    component: "cart_products",
                    props: {
                    empty_cart_children: [
                        {
                            element_id: 7865,
                            component: "button",
                            props: {
                                text: "Lets go shopping",
                            },
                        }
                    ]
                    },
                    children: [
                    {
                        element_id: 3443,
                        component: "cart_item",
                        props: {
                        },
                    },
                    {
                        element_id: 343545,
                        component: "cart_item_qty",
                        props: {
                        },
                    },
                    {
                        element_id: 33465443,
                        component: "cart_title",
                        props: {
                        },
                    },
                    {
                        element_id: 3287237823,
                        component: "cart_variant_title",
                        props: {
                        },
                    },
                    {
                        element_id: 7676,
                        component: "cart_price",
                        props: {
                        },
                    },
                    ]
                },
                {
                    element_id: 344343,
                    component: "cart_count",
                    props: {
                    },
                },
                {
                    element_id: 3454466,
                    component: "cart_total",
                    props: {
                    },
                },
            ],
        },
        // {
        //     component: "standard_overlay",
        //     overlay_id: 454,
        //     props: {
        //         overlay_id: 454,
        //         zIndex: 60,
        //     },
        //     children: [],
        // }
    ],
    components: {
        "product_tile": {
            children: [],
        },
    },
      collection_templates: {
        default_template: "minimal",
        custom_product_map: {
            "valentines-sale": "default",
        },
        templates: {
            "default":  { 
                title: "Default epic template",
                children: [
                    { 
                        id: 34433434,
                        title:"hello default epic template"
                    }
                ],
                no_product_children: [],
             },
        },
    },
    product_templates: {
        default_template: "minimal",
        custom_product_map: {
            "cameira-floral-sleepwear-robe-dusty-blue": "default",
            "milky-lace-suspender-skirt-black": "minimal",
        },
        templates: {
            "default":  { 
                title: "Default epic template",
                children: [
                    { 
                        id: 233223,
                        title:"hello default epic template"
                    }
                ],
                no_product_children: [],
             },
            "minimal": { 
                title: "Minimal template",
                children: [
                    {
                        component: "title",
                        element_id: "4343",
                        props: {
                            text: "Whadduppp yoooooo"
                        }
                    },
                    {
                        component: "product_title",
                        element_id: "rttrtr",
                        props: {}
                    },
                    {
                        component: "product_title",
                        element_id: "4554544",
                        props: {
                            Tag: "h2"
                        }
                    },
                    { 
                        element_id: "2334443344343433232",
                        component: "variant_selector",
                        props: {
                        }
                    },
                    { 
                        element_id: "23343232",
                        component: "add_to_cart_button",
                        props: {
                        }
                    },
                    { 
                        element_id: "23344343433232",
                        component: "collection_form",
                        props: {
                            // collection_handle: "summer-2026",
                            collection_id: "gid://shopify/Collection/426930012392",
                            initial_number_of_products: 10,
                            paginate_by: 30,
                            no_collection_children: [
                                 { 
                                    element_id: "45trgf",
                                    component: "title",
                                    props: {
                                        text: "NO COLLECTION FOUND!"
                                    }
                                }
                            ]
                        },
                        children: [
                             {
                                component: "product_title",
                                element_id: "34433443",
                                props: {}
                            },
                             {
                                component: "product_price",
                                element_id: "343443",
                                props: {}
                            },
                             { 
                                element_id: "4545erere5",
                                component: "variant_selector",
                                props: {
                                }
                            },
                            { 
                                element_id: "errere",
                                component: "add_to_cart_button",
                                props: {
                                }
                            },
                        ]
                    },
                    {
                        component: "product_title",
                        element_id: "ert54",
                        props: {}
                    },
                    {
                        component: "product_wrapper",
                        element_id: "123",
                        props: { 
                            product_handle: "cameira-floral-sleepwear-robe-dusty-blue",
                            no_product_children: [
                                { 
                                    element_id: "w4343e",
                                    component: "title",
                                    props: {
                                        text: "NO PRODUCT CHILDREN!"
                                    }
                                },
                                { 
                                    element_id: "4554",
                                    component: "button",
                                    props: {
                                        text: "Butty bacon?"
                                    }
                                },
                            ],
                        },
                        children: [
                            {
                                component: "product_title",
                                element_id: "title1",
                                props: {}
                            },
                            {
                                component: "product_price",
                                element_id: "price1",
                                props: {}
                            },
                            {
                                component: "variant_selector_01",
                                element_id: "23435",
                                props: {}
                            },
                            { 
                                element_id: "4545",
                                title:"Yoyoyo",
                                component: "button",
                                props: {
                                    text: "Butty bacon?"
                                }
                            },
                            { 
                                element_id: "45455",
                                component: "variant_selector",
                                props: {
                                }
                            },
                            { 
                                element_id: "343r334",
                                component: "add_to_cart_button",
                                props: {
                                }
                            },
                        ]
                    },
                    

                ],
                no_product_children: [],
            }
        },
    },
    custom_pages: [
        {
            title: "My page",
            route_main: "lesgo",
            route_path: ["learn-more"],
            overlays: {},
            children: [],
        },
        {
            title: "My page 2",
            route_main: "browse",
            route_path: ["learn-more", "whats-new"],
            overlays: {},
            children: [],
        },
    ]
}

// Product/collection page: --> Get product ID, find the template for it (or use default)
// Custom page: --> Get the URL, match it to a route (or 404) and render the children