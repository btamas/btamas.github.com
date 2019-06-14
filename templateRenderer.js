class TemplateRenderer {
    constructor(partialPath) {
        this.partialPath = partialPath;
    }

    async render(name, data) {
        console.log(`render ${name} with ${JSON.stringify(data)}`);

        // load template if it has not loaded yet
        if (!document.getElementById(`partial-${name}`)) {
            await this._loadTemplate(name);
        }

        const template = document.getElementById(`partial-${name}`).content.cloneNode(true);

        // resolve partials
        await this._resolvePartials(template, data);

        // resolve content
        this._resolveContent(template, data);

        // resolve attributes
        this._resolveAttributes(template, data);
        return template;
    }

    async _loadTemplate(name) {
        const partial = document.createElement('template');
        partial.id = `partial-${name}`;
        const response = await fetch(`${this.partialPath}/${name}.html`);
        partial.innerHTML = await response.text();
        document.head.appendChild(partial);
    }

    async _resolvePartials(template, data) {
        template.querySelectorAll('[data-partial]').forEach(async partial => {
            const partialContextName = partial.dataset.partialContext;
            const partialContext = partialContextName ? data[partialContextName] : data;

            partial.replaceWith(
                await [].concat(partialContext).reduce(async (fragment, value) => {
                    (await fragment).appendChild(await this.render(partial.dataset.partial, value));
                    return fragment;
                }, Promise.resolve(new DocumentFragment()))
            );
        });
    }

    _resolveContent(template, data) {
        template.querySelectorAll('[data-content]').forEach(value => {
            value.innerText = data[value.dataset.content];
            value.removeAttribute('data-content');
        });
    }

    _resolveAttributes(template, data) {
        for (let element of template.children) {
            element
                .getAttributeNames()
                .filter(attribute => attribute.startsWith('data-'))
                .forEach(attribute => {
                    const attributeName = attribute.substr(5);
                    const attributeValueName = element.getAttribute(attribute);
                    element.setAttribute(attributeName, data[attributeValueName]);
                    element.removeAttribute(attribute);
                });
        }
    }
}
