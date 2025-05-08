/*
 * フォーム送信時のイベントハンドラ
 * mantela.json を取得し、接続情報を解析し、表示する。
 */
formMantela.addEventListener('submit', async e => {
	e.preventDefault();
	btnGenerate.disabled = true;
	const start = performance.now();
	outputStatus.textContent = '';
	const mantelas = await (_ => checkNest.checked
		? fetchMantelas(urlMantela.value, +numNest.value)
		: fetchMantelas(urlMantela.value))();
	const stop = performance.now();
	outputStatus.textContent = `Done. (${stop - start} ms)`;
	btnGenerate.disabled = false;

	const prefixes = [
		['局名', 'prefix']
	]

	mantelas.forEach((v, _) => {
		if (v.aboutMe.preferredPrefix != undefined && v.aboutMe.preferredPrefix.toString() != "") {
			prefixes.push([v.aboutMe.name, v.aboutMe.preferredPrefix.toString().replaceAll(',', ', ')]);
		}
	});

	console.log(prefixes)
	const table = document.createElement('table');

	prefixes.forEach((rowData, index) => {
		const row = document.createElement('tr');

		rowData.forEach(cellData => {
			const cell = document.createElement(index === 0 ? 'th' : 'td');
			cell.textContent = cellData;
			row.appendChild(cell);
		});

		table.appendChild(row);
		document.getElementById('table-container').innerHTML = table.outerHTML;
	});
});

/*
 * first のパラメータが指定されているときは自動入力して表示する
 */
const urlSearch = new URLSearchParams(document.location.search);
if (urlSearch.get('first')) {
	urlMantela.value = urlSearch.get('first');
	btnGenerate.click();
}
