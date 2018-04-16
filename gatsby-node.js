'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const crypto = require('crypto');
const axios = require('axios');

var _require = require(`gatsby-source-filesystem`);

const createFilePath = _require.createFilePath;


exports.sourceNodes = (() => {
    var _ref = _asyncToGenerator(function* ({ boundActionCreators: { createNode } }, { pixelPubApiKey }) {
        const client = Axios.create({
            baseURL: `https://pxp.paulender.com/api/`,
            headers: {
                "X-API-KEY": pixelPubApiKey
            }
        });

        // Get list of all clans
        const data = yield client.get('/clan/members');

        createNode({
            data,
            id: 'pixel-pub-clan-list',
            parent: null,
            children: data.map(function (d) {
                return `pixel-pub-clan-${datum.group_id}`;
            }),
            internal: {
                type: "PxpClanList",
                content: JSON.stringify(data),
                contentDigest: crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
            }
        });

        data.forEach(function (datum) {
            let _string = JSON.stringify(datum);
            createNode(_extends({}, datum, {
                id: `pixel-pub-clan-${datum.group_id}`,
                parent: null,
                children: [],
                internal: {
                    type: "PxpClanEntry",
                    content: _string,
                    contentDigest: crypto.createHash('md5').update(_string).digest('hex')
                }
            }));
        });
    });

    return function (_x, _x2) {
        return _ref.apply(this, arguments);
    };
})();

exports.onCreateNode = ({ node, getNode, boundActionCreators }) => {
    const createNodeField = boundActionCreators.createNodeField;


    if (node.internal.type === "PxpClanEntry") {
        const slug = createFilePath({ node, getNode, basePath: `pages` });

        createNodeField({
            node,
            name: 'slug',
            value: slug
        });
    }
};

exports.createPages = ({ graphql, boundActionCreators }, { pixelPubClanComponent }) => {
    const createPage = boundActionCreators.createPage;


    return new Promise((resolve, reject) => {
        graphql(`
            allPxpClanEntry {
                edges {
                    node
                }
            }
        `).then(r => {
            r.data.allPxpClanEntry.edges.forEach(({ node }) => {
                createPage({
                    path: node.fields.slug,
                    component: pixelPubClanComponent,
                    context: {
                        node
                    }
                });
            });

            resolve();
        });
    });
};