import { LitElement, html, css } from 'lit-element'

export class EditableListItem extends LitElement {
  static get properties() {
    return {
      item: Object,
      isEditing: Boolean,
      fields: Array,
      updateFunction: Function
    }
  }

  render() {
    const editingTemplate = html`
      <form id="form" @submit=${this.updateItem}>
        ${this.fields.map(
          f => html`
            <input type=${f.type} name=${f.name} .value=${this.item[f.name]} ?hidden=${!f.display?.editing} />
          `
        )}

        <input type="submit" value="save" />
        <button @click=${this.toggleEditMode}>cancel</button>
      </form>
    `

    const plainTemplate = html`
      ${this.fields.map(f => html` ${f.display?.plain ? html`<span>${this.item[f.name]}</span>` : html``} `)}
      <button @click=${this.toggleEditMode}>edit</button>
    `

    const template = this.isEditing ? editingTemplate : plainTemplate
    return template
  }

  constructor() {
    super()

    /**
     * field = {
     *  name: string,
     *  type: string,
     *  display: Object
     * }
     *
     * displayOption = {
     *  editing: boolean,
     *  plain: boolean
     * }
     */
    this.fields = []
  }

  toggleEditMode() {
    this.isEditing = !this.isEditing
  }

  quitEditMode() {
    const form = this.renderRoot.querySelector('#form')
    form.reset()

    this.isEditing = false
  }

  async updateItem(e) {
    e.preventDefault()

    const updateObj = this.serialize()
    await this.updateFunction(updateObj)

    this.quitEditMode()
  }

  serialize() {
    const form = this.renderRoot.querySelector('#form')
    const formData = new FormData(form)
    const updateObj = Object.fromEntries(formData.entries())

    return updateObj
  }
}

customElements.define('editable-list-item', EditableListItem)
