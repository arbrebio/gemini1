import { q as createVNode, F as Fragment, _ as __astro_tag_component__ } from "./vendor_Cx2pFmu4.mjs";
import "clsx";
const frontmatter = {
  "title": "The Benefits of Coco Peat for Soil Health and Crop Production",
  "description": "Discover how coco peat can improve soil structure, water retention, and overall crop health in African agriculture.",
  "pubDate": "2024-01-25T00:00:00.000Z",
  "author": "Arbre Bio Africa Team",
  "image": "https://imgur.com/BJnjT1c.jpg",
  "category": "substrates",
  "featured": false
};
function getHeadings() {
  return [{
    "depth": 2,
    "slug": "what-is-coco-peat",
    "text": "What is Coco Peat?"
  }, {
    "depth": 2,
    "slug": "benefits-for-african-agriculture",
    "text": "Benefits for African Agriculture"
  }];
}
function _createMdxContent(props) {
  const _components = {
    h2: "h2",
    li: "li",
    ol: "ol",
    p: "p",
    strong: "strong",
    ul: "ul",
    ...props.components
  };
  return createVNode(Fragment, {
    children: [createVNode(_components.p, {
      children: "Coco peat is revolutionizing agriculture with its exceptional properties. Learn how this sustainable growing medium can transform your farming practices."
    }), "\n", createVNode(_components.h2, {
      id: "what-is-coco-peat",
      children: "What is Coco Peat?"
    }), "\n", createVNode(_components.p, {
      children: "Coco peat is a natural fiber made from coconut husks, offering excellent properties for plant growth:"
    }), "\n", createVNode(_components.ul, {
      children: ["\n", createVNode(_components.li, {
        children: "High water retention"
      }), "\n", createVNode(_components.li, {
        children: "Excellent aeration"
      }), "\n", createVNode(_components.li, {
        children: "pH balanced"
      }), "\n", createVNode(_components.li, {
        children: "Pathogen-free"
      }), "\n"]
    }), "\n", createVNode(_components.h2, {
      id: "benefits-for-african-agriculture",
      children: "Benefits for African Agriculture"
    }), "\n", createVNode(_components.ol, {
      children: ["\n", createVNode(_components.li, {
        children: ["\n", createVNode(_components.p, {
          children: createVNode(_components.strong, {
            children: "Water Management"
          })
        }), "\n", createVNode(_components.ul, {
          children: ["\n", createVNode(_components.li, {
            children: "Reduces irrigation frequency"
          }), "\n", createVNode(_components.li, {
            children: "Prevents water logging"
          }), "\n", createVNode(_components.li, {
            children: "Maintains moisture levels"
          }), "\n"]
        }), "\n"]
      }), "\n", createVNode(_components.li, {
        children: ["\n", createVNode(_components.p, {
          children: createVNode(_components.strong, {
            children: "Root Development"
          })
        }), "\n", createVNode(_components.ul, {
          children: ["\n", createVNode(_components.li, {
            children: "Promotes healthy growth"
          }), "\n", createVNode(_components.li, {
            children: "Prevents root diseases"
          }), "\n", createVNode(_components.li, {
            children: "Improves nutrient uptake"
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "Contact us to learn more about our premium coco peat products."
    })]
  });
}
function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout ? createVNode(MDXLayout, {
    ...props,
    children: createVNode(_createMdxContent, {
      ...props
    })
  }) : _createMdxContent(props);
}
const url = "src/content/blog/coco-peat-benefits.mdx";
const file = "/Users/sydneyrolandabouna/Downloads/gemini1-main/src/content/blog/coco-peat-benefits.mdx";
const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment, ...props.components }
});
Content[Symbol.for("mdx-component")] = true;
Content[Symbol.for("astro.needsHeadRendering")] = !Boolean(frontmatter.layout);
Content.moduleId = "/Users/sydneyrolandabouna/Downloads/gemini1-main/src/content/blog/coco-peat-benefits.mdx";
__astro_tag_component__(Content, "astro:jsx");
export {
  Content,
  Content as default,
  file,
  frontmatter,
  getHeadings,
  url
};
