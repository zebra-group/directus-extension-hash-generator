import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './Interface.vue';

export default defineInterface({
	id: 'hash-generator',
	name: 'Hash Generator',
	icon: 'numbers',
	description: 'This is a hash generator interface',
	component: InterfaceComponent,
	types: ['string'],
	group: 'standard',
	options: [
			{
					field: 'length',
					name: '$t:length',
					type: 'integer',
					meta: {
							interface: 'slider',
							width: 'full',
							options: {
								min: 0,
								max: 30,
								step: 1
							}
					}
			},
			{
				field: 'set_on_create',
				type: 'boolean',
				name: '$t:on_create',
				meta: {
					interface: 'toggle',
					width: 'half',
				}
			},
			{
				field: 'can_be_updated',
				type: 'boolean',
				name: 'Can be updated',
				meta: {
					interface: 'toggle',
					width: 'half',
				}
			},
			{
				field: 'allow_numbers',
				type: 'boolean',
				name: 'Allow numbers',
				meta: {
					interface: 'toggle',
					width: 'half',
				}
			},
			{
				field: 'allow_special_characters',
				type: 'boolean',
				name: 'Allow special characters',
				meta: {
					interface: 'toggle',
					width: 'half',
				}
			},
			{
				field: 'allow_uppercase',
				type: 'boolean',
				name: 'Allow uppercase',
				meta: {
					interface: 'toggle',
					width: 'half',
				}
			}
	]
});
