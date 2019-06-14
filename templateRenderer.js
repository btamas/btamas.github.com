class TemplateRenderer {
    constructor(templatePath) {
        this.templatePath = templatePath;
    }

    async render(name, data) {
        console.log(`render ${name} with ${JSON.stringify(data)}`);
        if (!document.getElementById(`template-${name}`)) {
            await this._loadTemplate(name);
        }
        const template = document.getElementById(`template-${name}`).content.cloneNode(true);
        await template.querySelectorAll('template[data-partial]').forEach(async partial => {
            const partialValueName = partial.getAttribute('data-partial-value');
            const partialValue = partialValueName ? data[partialValueName] : data;
            const partialArrayValue = Array.isArray(partialValue) ? partialValue : [partialValue];

            partial.replaceWith(
                await partialArrayValue.reduce(async (fragment, value) => {
                    (await fragment).appendChild(await this.render(partial.getAttribute('data-partial'), value));
                    return fragment;
                }, Promise.resolve(new DocumentFragment()))
            );
        });
        template.querySelectorAll('[data-value]').forEach(value => {
            value.innerText = data[value.getAttribute('data-value')];
            value.removeAttribute('data-value');
        });

        for (let element of template.children) {
            element.getAttributeNames().forEach(attribute => {
                if (attribute.startsWith('data-')) {
                    const attributeName = attribute.substr(5);
                    const attributeValueName = element.getAttribute(attribute);
                    element.setAttribute(attributeName, data[attributeValueName]);
                    element.removeAttribute(attribute);
                }
            });
        }
        return template;
    }

    async _loadTemplate(name) {
        const template = document.createElement('template');
        template.id = `template-${name}`;
        const response = await fetch(`${this.templatePath}/${name}.html`);
        template.innerHTML = await response.text();
        document.head.appendChild(template);
    }
}
