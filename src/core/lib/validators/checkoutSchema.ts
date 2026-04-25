import * as yup from 'yup';

export const checkoutSchema = yup.object({
  fullName: yup.string().required('Nome completo é obrigatório'),
  email: yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
  cpf: yup
    .string()
    .matches(/^\d{11}$/, 'CPF deve conter 11 dígitos numéricos')
    .required('CPF é obrigatório'),
  phone: yup
    .string()
    .matches(/^\d{10,11}$/, 'Telefone deve conter 10 ou 11 dígitos numéricos')
    .required('Telefone é obrigatório'),
  address: yup.object({
    street: yup.string().required('Rua é obrigatória'),
    number: yup.string().required('Número é obrigatório'),
    neighborhood: yup.string().required('Bairro é obrigatório'),
    city: yup.string().required('Cidade é obrigatória'),
    state: yup.string().required('Estado é obrigatório'),
    zipCode: yup
      .string()
      .matches(/^\d{8}$/, 'CEP deve conter 8 dígitos')
      .required('CEP é obrigatório'),
  }),
});
