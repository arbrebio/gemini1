import { q as createVNode, F as Fragment, _ as __astro_tag_component__ } from "./vendor_Cx2pFmu4.mjs";
import "clsx";
const frontmatter = {
  "title": "10 Proven Strategies to Increase Farm Yields in Africa",
  "description": "Practical tips and techniques to boost agricultural productivity in African farming conditions, from soil management to modern technology adoption.",
  "pubDate": "2024-01-30T00:00:00.000Z",
  "author": "Arbre Bio Africa Team",
  "image": "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3",
  "category": "farming-tips",
  "featured": true
};
function getHeadings() {
  return [{
    "depth": 2,
    "slug": "key-strategies",
    "text": "Key Strategies"
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
      children: "Discover proven strategies to significantly increase your farm’s productivity while maintaining sustainability."
    }), "\n", createVNode(_components.h2, {
      id: "key-strategies",
      children: "Key Strategies"
    }), "\n", createVNode(_components.ol, {
      children: ["\n", createVNode(_components.li, {
        children: ["\n", createVNode(_components.p, {
          children: createVNode(_components.strong, {
            children: "Soil Management"
          })
        }), "\n", createVNode(_components.ul, {
          children: ["\n", createVNode(_components.li, {
            children: "Regular testing"
          }), "\n", createVNode(_components.li, {
            children: "Proper amendments"
          }), "\n", createVNode(_components.li, {
            children: "Crop rotation"
          }), "\n"]
        }), "\n"]
      }), "\n", createVNode(_components.li, {
        children: ["\n", createVNode(_components.p, {
          children: createVNode(_components.strong, {
            children: "Water Efficiency"
          })
        }), "\n", createVNode(_components.ul, {
          children: ["\n", createVNode(_components.li, {
            children: "Modern irrigation"
          }), "\n", createVNode(_components.li, {
            children: "Water harvesting"
          }), "\n", createVNode(_components.li, {
            children: "Moisture monitoring"
          }), "\n"]
        }), "\n"]
      }), "\n", createVNode(_components.li, {
        children: ["\n", createVNode(_components.p, {
          children: createVNode(_components.strong, {
            children: "Technology Integration"
          })
        }), "\n", createVNode(_components.ul, {
          children: ["\n", createVNode(_components.li, {
            children: "Smart farming tools"
          }), "\n", createVNode(_components.li, {
            children: "Climate monitoring"
          }), "\n", createVNode(_components.li, {
            children: "Yield tracking"
          }), "\n"]
        }), "\n"]
      }), "\n"]
    }), "\n", createVNode(_components.p, {
      children: "Contact our team for personalized advice on implementing these strategies."
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
const url = "src/content/blog/increase-farm-yields.mdx";
const file = "/Users/sydneyrolandabouna/Downloads/gemini1-main/src/content/blog/increase-farm-yields.mdx";
const Content = (props = {}) => MDXContent({
  ...props,
  components: { Fragment, ...props.components }
});
Content[Symbol.for("mdx-component")] = true;
Content[Symbol.for("astro.needsHeadRendering")] = !Boolean(frontmatter.layout);
Content.moduleId = "/Users/sydneyrolandabouna/Downloads/gemini1-main/src/content/blog/increase-farm-yields.mdx";
__astro_tag_component__(Content, "astro:jsx");
export {
  Content,
  Content as default,
  file,
  frontmatter,
  getHeadings,
  url
};
