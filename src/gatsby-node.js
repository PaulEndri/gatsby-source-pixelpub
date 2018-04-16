const crypto             = require('crypto')
const axios              = require('axios')
const { createFilePath } = require(`gatsby-source-filesystem`);

exports.sourceNodes = async ({ boundActionCreators: { createNode } }, { pixelPubApiKey }) => {
    const client = Axios.create(
        {
            baseURL: `https://pxp.paulender.com/api/`,
            headers: {
                "X-API-KEY" : pixelPubApiKey
            }
        }
    );

    // Get list of all clans
    const data = await client.get('/clan/members');
    
    createNode({
        data,
        id : 'pixel-pub-clan-list',
        parent : null,
        children : data.map(d => `pixel-pub-clan-${datum.group_id}`),
        internal : {
            type          : "PxpClanList",
            content       : JSON.stringify(data),
            contentDigest : crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
        }
    });

    data.forEach(datum => {
        let _string = JSON.stringify(datum);
        createNode({
            ...datum,
            id       : `pixel-pub-clan-${datum.group_id}`,
            parent   : null,
            children : [],
            internal : {
                type          : "PxpClanEntry",
                content       : _string,
                contentDigest : crypto.createHash('md5').update(_string).digest('hex')
            }
        });
    });
};

exports.onCreateNode = ({node, getNode, boundActionCreators}) => {
    const { createNodeField } = boundActionCreators;

    if (node.internal.type === "PxpClanEntry") {
        const slug = createFilePath({ node, getNode, basePath: `pages` });

        createNodeField({
            node,
            name  : 'slug',
            value : slug
        });
    }
};


exports.createPages = ({ graphql, boundActionCreators }, { pixelPubClanComponent }) => {
    const { createPage } = boundActionCreators;

    return new Promise((resolve, reject) => {
        graphql(`
            allPxpClanEntry {
                edges {
                    node
                }
            }
        `)
            .then(r => {
                r.data.allPxpClanEntry.edges.forEach(({node}) => {
                    createPage({
                        path      : node.fields.slug,
                        component : pixelPubClanComponent,
                        context   : {
                            node
                        }
                    })
                });
                
                resolve();
            })
    })
};