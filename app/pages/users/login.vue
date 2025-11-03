<script setup>
const email = ref('')
const password = ref('')

const response = await fetch('/api/users/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  body: JSON.stringify({
    email: email.value,
    password: password.value,
  }),
})

const data = await response.json()
console.log(data)
</script>
<template></template>
