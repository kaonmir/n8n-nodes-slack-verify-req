import { Client } from '@gradio/client';
const app = await Client.connect('http://kotaemon.ops.infograb.io');
// JSON 문자열을 가정하고 변수 선언
const jsonString =
	'{"chat_history": [["gitlab?", null]], "llm_type": "openrouter", "use_citation": "highlight", "language": "ko", "param_11": "select", "param_12": [""]}';

// JSON 문자열을 객체로 변환
const requestData = JSON.parse(jsonString);
console.log(requestData);

var result2 = await app.predict('/chat_fn', requestData);
console.log(result2);

process.exit();

const [kotaemon, html, plot] = result.data;
process.exit();
