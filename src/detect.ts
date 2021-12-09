const AMR_WB_HEADER = "#!AMR-WB\n";
const AMR_NB_HEADER = "#!AMR\n";

export const detect = async (file: File | ArrayBuffer) => {
	const slice = file.slice(0, AMR_WB_HEADER.length);

	const magic = new TextDecoder().decode(
		slice instanceof Blob ? await slice.arrayBuffer() : slice,
	);

	if (magic === AMR_WB_HEADER) return "amrwb";
	if (magic.startsWith(AMR_NB_HEADER)) return "amrnb";
	return false;
};
