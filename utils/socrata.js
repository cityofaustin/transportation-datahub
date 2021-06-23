import useSWR from "swr";

const handleFetchArgs = (args) => {
	// expects array of three args: [0] a socrata resource id, [1] the output format (e.g. json or geojson), [3] optional query string
	let url = `https://data.austintexas.gov/resource/${args[0]}.${args[1]}`;
	url = args[2] ? `${url}?${args[2]}` : url;
	return url;
};

const fetcher = (...args) =>
	fetch(handleFetchArgs(args)).then((res) => res.json());

export default function useSocrata({ resourceId, format, query }) {
	// by passing an array of args as the useSWR key, SWR will detect changes to the inputs and re-fetch as needed
	const { data, error } = useSWR([resourceId, format, query], fetcher);
	return {
		data: data,
		loading: !error && !data,
		error: error,
	};
}
