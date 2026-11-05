module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // <img> usado em conteúdo dinâmico de tenants (URLs externas arbitrárias)
    "@next/next/no-img-element": "off",
  },
};
