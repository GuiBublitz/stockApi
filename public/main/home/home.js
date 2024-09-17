document.addEventListener("DOMContentLoaded", (event) => {
    new Choices('#tipo-ativo', {
        searchEnabled: true,
        removeItemButton: true,
        placeholderValue: 'Escolha um Tipo de Ativo'
    });

    new Choices('#ativo', {
        searchEnabled: true,
        removeItemButton: true,
        placeholderValue: 'Escolha um Ativo'
    });

    new Cleave('#preco', {
        numeral: true,
        numeralDecimalMark: ',',
        delimiter: '.',
        numeralDecimalScale: 2,
        prefix: 'R$ ',
        numeralThousandsGroupStyle: 'thousand'
    });

    new Cleave('#outros-custos', {
        numeral: true,
        numeralDecimalMark: ',',
        delimiter: '.',
        numeralDecimalScale: 2,
        prefix: 'R$ ',
        numeralThousandsGroupStyle: 'thousand'
    });
});