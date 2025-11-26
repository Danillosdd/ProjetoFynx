import { z } from "zod";

// Customização das mensagens de erro do Zod para português
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === "string") {
      return { message: "Campo obrigatório" };
    }
    if (issue.expected === "number") {
      return { message: "Deve ser um número" };
    }
  }
  
  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === "string") {
      return { message: "Campo obrigatório" };
    }
    if (issue.type === "number") {
      return { message: `Valor mínimo: ${issue.minimum}` };
    }
  }

  if (issue.code === z.ZodIssueCode.too_big) {
    if (issue.type === "string") {
      return { message: `Máximo de ${issue.maximum} caracteres` };
    }
    if (issue.type === "number") {
      return { message: `Valor máximo: ${issue.maximum}` };
    }
  }

  if (issue.code === z.ZodIssueCode.invalid_string) {
    if (issue.validation === "email") {
      return { message: "E-mail inválido" };
    }
  }

  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);

export { z };
