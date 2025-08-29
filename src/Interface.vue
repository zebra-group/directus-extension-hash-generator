<template>
	<div class="hash-generation">
		<VInput :modelValue="value" disabled :class="{ 'with-button': fieldData.meta.options.can_be_updated }" />
		<VButton @click="handleHashGeneration" v-if="fieldData.meta.options.can_be_updated" :class="{ 'rotate-icon': isRotating }">
			<VIcon class="icon" name="refresh" />
		</VButton>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useApi } from '@directus/extensions-sdk';

const props = defineProps<{
	value: string;
	primaryKey: string,
	fieldData: {
		collection: string
		field: string
		meta: {
			options: {
				set_on_create: boolean,
				can_be_updated: boolean
				allow_numbers: boolean,
				allow_special_characters: boolean,
				allow_uppercase: boolean,
				length: number
			}
		},
		schema: {
			is_unique: boolean
		}
	}
}>()

const emits = defineEmits(['input'])

const api = useApi()
const isRotating = ref(false);
const hashes = ref<string[]>([])

const options = props.fieldData.meta.options;
const chars = [
	...(options.allow_numbers ? '0123456789' : ''),
	'abcdefghijklmnopqrstuvwxyz',
	...(options.allow_uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ''),
	...(options.allow_special_characters ? '!@#$%^&*()-_=+[]{}|;:,.<>?/' : '')
].join('');

function generateHash() {
	function processHashGeneration() {
		let result = '';
		for(let i = 0; i < options.length; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
	}

	let newHash = processHashGeneration();

	if(!props.fieldData.schema.is_unique) return newHash;

	while(hashes.value.includes(newHash)) {
		newHash = processHashGeneration();
	}

	return newHash;
}

function handleHashGeneration() {
	isRotating.value = true;
	setTimeout(() => {
		isRotating.value = false;
	}, 600);

	const newHash = generateHash();

	emits('input', newHash);
}

onMounted(async () => {
	const { data } = await api.get(`/items/${props.fieldData.collection}`, {
		params: {
			fields: [
				props.fieldData.field
			].toString()
		}
	});

	hashes.value = data.data.map((item: { [key: string]: any }) => item[props.fieldData.field]);

	if(props.primaryKey === '+' && props.fieldData.meta.options.set_on_create && !props.value) {
		handleHashGeneration();
	}
});
</script>

<style scoped lang="postcss">
.hash-generation {
	display: flex;
}

.v-input.with-button {
	--v-input-border-radius: var(--theme--border-radius) 0 0 var(--theme--border-radius);
}

.hash-generation :deep(.v-button) button {
	height: 100%;
	border-radius: 0 var(--theme--border-radius) var(--theme--border-radius) 0;;
}

.rotate-icon .icon {
	animation: rotate 0.6s linear;
}

@keyframes rotate {
	100% {
		transform: rotate(360deg);
	}
}
</style>