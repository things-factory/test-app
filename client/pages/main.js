import { PageView, store, client } from '@things-factory/shell'
import { html, css } from 'lit-element'
import { connect } from 'pwa-helpers/connect-mixin.js'
import gql from 'graphql-tag'
import '../components/editable-list-item'

class TestAppMain extends connect(store)(PageView) {
  static get styles() {
    return css`
      #add-employee-form > label {
        display: block;
      }
    `
  }

  static get properties() {
    return {
      employees: Array
    }
  }

  render() {
    const fieldOptions = [
      {
        name: 'id',
        type: 'text',
        display: {
          editing: false,
          plain: false
        }
      },
      {
        name: 'name',
        type: 'text',
        display: {
          editing: true,
          plain: true
        }
      },
      {
        name: 'email',
        type: 'email',
        display: {
          editing: true,
          plain: true
        }
      },
      {
        name: 'age',
        type: 'number',
        display: {
          editing: true,
          plain: true
        }
      }
    ]
    return html`
      <section>
        <h3>Employees</h3>
        <ul>
          ${this.employees.map(
            (e, i) => html`
              <li>
                <editable-list-item
                  .item=${e}
                  .fields=${fieldOptions}
                  .updateFunction=${async updateObj => {
                    const { id, name, email, age } = updateObj
                    const parsedNewEmployeeObj = {
                      id,
                      name,
                      email,
                      age: Number(age)
                    }

                    const updatedEmployee = await this.createOrUpdateEmployee(parsedNewEmployeeObj)

                    this.refresh()
                  }}
                ></editable-list-item>
              </li>
            `
          )}
        </ul>
        <button @click=${this.refresh}>refresh</button>
        <form id="add-employee-form" @submit=${this.addEmployee}>
          <label>
            이름
            <input name="name" />
          </label>
          <label>
            이메일
            <input type="email" name="email" />
          </label>
          <label>
            나이
            <input type="number" name="age" />
          </label>
          <input type="submit" value="create" />
        </form>
      </section>
    `
  }

  constructor() {
    super()

    this.employees = []
  }

  firstUpdated() {
    this.refresh()
  }

  stateChanged(state) {
    // this.testApp = state.testApp.state_main
  }

  async refresh() {
    const response = await client.query({
      query: gql`
        query {
          employees {
            id
            name
            email
            age
          }
        }
      `
    })

    this.employees = response.data.employees
  }

  async addEmployee(e) {
    e.preventDefault()

    const form = this.renderRoot.querySelector('#add-employee-form')
    const formData = new FormData(form)
    const newEmployeeObj = Object.fromEntries(formData.entries())
    const { name, email, age } = newEmployeeObj

    const parsedNewEmployeeObj = {
      name,
      email,
      age: Number(age)
    }

    const createdEmployee = await this.createOrUpdateEmployee(parsedNewEmployeeObj)

    console.log(`새로운 직원이 추가되었습니다.: %o`, createdEmployee)

    form.reset()

    this.refresh()
  }

  async createOrUpdateEmployee(newEmpolyee) {
    const response = await client.mutate({
      mutation: gql`
        mutation createOrUpdateEmployee($newEmpolyee: EmployeeInput) {
          createOrUpdateEmployee(employee: $newEmpolyee) {
            id
          }
        }
      `,
      variables: {
        newEmpolyee
      }
    })

    return response.data.createOrUpdateEmployee
  }
}

window.customElements.define('test-app-main', TestAppMain)
