import { mount } from '@vue/test-utils'
import Interface from '../Interface.vue'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock @directus/extensions-sdk useApi
const getMock = vi.fn()
vi.mock('@directus/extensions-sdk', () => ({
	useApi: () => ({ get: getMock })
}))

// Simple stubs for Directus UI components
const VButtonStub = {
	name: 'VButton',
	emits: ['click'],
	template: '<button class="v-button"><slot/></button>'
}

const VInputStub = {
	name: 'VInput',
	props: {
		modelValue: String,
		disabled: Boolean
	},
	emits: ['update:modelValue'],
	template: '<input class="v-input" :disabled="disabled" />'
}

const VIconStub = {
	name: 'VIcon',
	props: { name: String },
	template: '<span class="icon"></span>'
}

function createProps(overrides: Partial<any> = {}) {
	return {
		value: overrides.value ?? '',
		primaryKey: overrides.primaryKey ?? '+',
		fieldData: {
			collection: 'posts',
			field: 'hash',
			meta: {
				options: {
					length: 5,
					set_on_create: true,
					can_be_updated: true,
					allow_numbers: false,
					allow_special_characters: false,
					allow_uppercase: false,
					...overrides.options
				}
			},
			schema: {
				is_unique: overrides.is_unique ?? false
			}
		},
		...overrides
	}
}

async function flushAll() {
	// Flush pending microtasks and timers
	await Promise.resolve()
	await Promise.resolve()
}

describe('Interface.vue - Hash Generator', () => {
	beforeEach(() => {
		getMock.mockReset()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('fetches existing hashes on mount and calls correct endpoint', async () => {
		getMock.mockResolvedValueOnce({ data: { data: [{ hash: 'abc' }, { hash: 'def' }] } })
		const wrapper = mount(Interface, {
			props: createProps(),
			global: { stubs: { VButton: VButtonStub, VInput: VInputStub, VIcon: VIconStub } }
		})
		await flushAll()

		expect(getMock).toHaveBeenCalledTimes(1)
		expect(getMock).toHaveBeenCalledWith('/items/posts', {
			params: { fields: 'hash' }
		})

		wrapper.unmount()
	})

	it('renders button only when can_be_updated is true and toggles input class', async () => {
		getMock.mockResolvedValue({ data: { data: [] } })
		const wrapperTrue = mount(Interface, {
			props: createProps({ options: { can_be_updated: true } }),
			global: { stubs: { VButton: VButtonStub, VInput: VInputStub, VIcon: VIconStub } }
		})
		await flushAll()
		expect(wrapperTrue.find('button.v-button').exists()).toBe(true)
		// VInput receives class "with-button" on original component; ensure class is applied on the element
		expect(wrapperTrue.find('.v-input.with-button').exists()).toBe(true)
		wrapperTrue.unmount()

		const wrapperFalse = mount(Interface, {
			props: createProps({ options: { can_be_updated: false } }),
			global: { stubs: { VButton: VButtonStub, VInput: VInputStub, VIcon: VIconStub } }
		})
		await flushAll()
		expect(wrapperFalse.find('button.v-button').exists()).toBe(false)
		expect(wrapperFalse.find('.v-input.with-button').exists()).toBe(false)
		wrapperFalse.unmount()
	})

	it('auto-generates on create when set_on_create is true and value empty', async () => {
		getMock.mockResolvedValue({ data: { data: [] } })
		// Force predictable random => always index 0
		const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
		const wrapper = mount(Interface, {
			props: createProps({ primaryKey: '+', options: { set_on_create: true, length: 4 } }),
			global: { stubs: { VButton: VButtonStub, VInput: VInputStub, VIcon: VIconStub } }
		})
		await flushAll()

		const emitted = wrapper.emitted('input')
		expect(emitted).toBeTruthy()
		expect(emitted!.length).toBeGreaterThan(0)
		const first = (emitted as unknown[][])[0]
		expect(first).toBeTruthy()
		const hash = first![0] as string
		expect(typeof hash).toBe('string')
		expect(hash).toHaveLength(4)
		expect(/^[a-z]+$/.test(hash)).toBe(true)
		randomSpy.mockRestore()
		wrapper.unmount()
	})

	it('does not auto-generate when not on create or set_on_create is false', async () => {
		getMock.mockResolvedValue({ data: { data: [] } })
		const wrapper1 = mount(Interface, {
			props: createProps({ primaryKey: '1', options: { set_on_create: true } }),
			global: { stubs: { VButton: VButtonStub, VInput: VInputStub, VIcon: VIconStub } }
		})
		await flushAll()
		expect(wrapper1.emitted('input')).toBeUndefined()
		wrapper1.unmount()

		const wrapper2 = mount(Interface, {
			props: createProps({ primaryKey: '+', options: { set_on_create: false } }),
			global: { stubs: { VButton: VButtonStub, VInput: VInputStub, VIcon: VIconStub } }
		})
		await flushAll()
		expect(wrapper2.emitted('input')).toBeUndefined()
		wrapper2.unmount()
	})

	it('generates hash with allowed character sets and correct length', async () => {
		getMock.mockResolvedValue({ data: { data: [] } })
		// numbers + lowercase + uppercase + specials
		const wrapper = mount(Interface, {
			props: createProps({
				options: {
					length: 8,
					allow_numbers: true,
					allow_uppercase: true,
					allow_special_characters: true
				}
			}),
			global: { stubs: { VButton: VButtonStub, VInput: VInputStub, VIcon: VIconStub } }
		})
		await flushAll()

		// Click the button to generate
		await wrapper.find('button.v-button').trigger('click')
		const events = wrapper.emitted('input')
		expect(events).toBeTruthy()
		expect(events!.length).toBeGreaterThan(0)
		const first = (events as unknown[][])[0]
		expect(first).toBeTruthy()
		const hash = first![0] as string
		expect(hash).toHaveLength(8)
		// Should be drawn from these sets
		const allowed = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-_=+[]{}|;:,.<>?/'
		expect([...hash].every((c) => allowed.includes(c))).toBe(true)
		wrapper.unmount()
	})

  // FIXME: Runs into OOM on CI
	it('ensures uniqueness when schema.is_unique is true by regenerating on collision', async () => {
		// Existing hash will collide with first generation
		getMock.mockResolvedValue({ data: { data: [{ hash: 'aaaaa' }] } })
		// First generation => all 'a' (index 0 for lowercase)
		// Second generation => all 'b' (index 1 for lowercase)
		const seq: number[] = [0, 0, 0, 0, 0, 1 / 26 + 0.0001, 1 / 26 + 0.0001, 1 / 26 + 0.0001, 1 / 26 + 0.0001, 1 / 26 + 0.0001]
		let i = 0
		const randomSpy = vi.spyOn(Math, 'random').mockImplementation(() => seq[i++] ?? 0)

		const wrapper = mount(Interface, {
			props: createProps({ is_unique: true, options: { length: 5 } }),
      attachTo: document.body,
			global: { stubs: { VButton: VButtonStub, VInput: VInputStub, VIcon: VIconStub } }
		})
		await flushAll()

		// Trigger generation manually via button
		await wrapper.find('button.v-button').trigger('click')
		const events2 = wrapper.emitted('input')
		expect(events2).toBeTruthy()
		expect(events2!.length).toBeGreaterThan(0)
		const first2 = (events2 as unknown[][])[0]
		expect(first2).toBeTruthy()
		const hash = first2![0] as string
		expect(hash).toBe('bbbbb')
		randomSpy.mockRestore()
		wrapper.unmount()
	})

	it('adds and removes rotation class around generation with timers', async () => {
		getMock.mockResolvedValue({ data: { data: [] } })
		vi.useFakeTimers()
		const wrapper = mount(Interface, {
			props: createProps({ options: { can_be_updated: true } }),
			global: { stubs: { VButton: VButtonStub, VInput: VInputStub, VIcon: VIconStub } }
		})
		await flushAll()

		await wrapper.find('button.v-button').trigger('click')
		// Class is applied on the VButton element via :class
		expect(wrapper.find('button.v-button.rotate-icon').exists()).toBe(true)

		vi.advanceTimersByTime(1000)
		await flushAll()
		expect(wrapper.find('button.v-button.rotate-icon').exists()).toBe(false)

		vi.useRealTimers()
		wrapper.unmount()
	})

	it('button click emits generated value once', async () => {
		getMock.mockResolvedValue({ data: { data: [] } })
		const wrapper = mount(Interface, {
			props: createProps({ options: { can_be_updated: true } }),
			global: { stubs: { VButton: VButtonStub, VInput: VInputStub, VIcon: VIconStub } }
		})
		await flushAll()

		await wrapper.find('button.v-button').trigger('click')
		expect(wrapper.emitted('input')?.length).toBe(1)
		wrapper.unmount()
	})
})
