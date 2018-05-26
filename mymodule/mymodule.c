#include <stdio.h>
#include <string.h>
#include <node_api.h>

napi_value myFunction(napi_env env, napi_callback_info info) {

	napi_status status;
	napi_value outstr;
	char str[] = "HalliHallo";

	status = napi_create_string_utf8(env, str, strlen(str), &outstr);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to create return value");
	}

	return outstr;
}

napi_value timesTwo(napi_env env, napi_callback_info info) {

	napi_status status;
	napi_value outval;
	size_t argc = 1;
	napi_value argv[1];
	double inval = 0.0;

	status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Failed to parse arguments");
	}

	status = napi_get_value_double(env, argv[0], &inval);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Invalid number was passed as argument");
	}

	inval *= 2.0;
	status = napi_create_double(env, inval, &outval);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to create return value");
	}

	return outval;
}

napi_value myObject(napi_env env, napi_callback_info info) {
	double *x;
	napi_value buf;
	napi_status status = napi_generic_failure;

	// const obj = {}
	napi_value obj, value;
	status = napi_create_object(env, &obj);


	// Create a napi_value for 123
	status = napi_create_int32(env, 123, &value);

	// obj.myProp = 123
	status = napi_set_named_property(env, obj, "myProp", value);
	
	status = napi_create_string_utf8(env, "Horst", strlen("Horst"), &value);
	status = napi_set_named_property(env, obj, "Vorname", value);

	// Create ArrayBuffer
	napi_create_arraybuffer(env, 40, (void**)&x, &buf);
	x[0] = 1.2345; x[1] = 344.009293; x[2] = -2332.99283; x[3] = -0.239488; x[4] = 521409348.3299;
	status = napi_set_named_property(env, obj, "doublearr", buf);
	return obj;
}

napi_value readObject(napi_env env, napi_callback_info info) {

	napi_status status;
	size_t argc = 1;
	napi_value argv[1];
	napi_value result;
	napi_value element;
	char buf[128];
	size_t numbytes;
	uint32_t len;

	status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Failed to parse arguments");
	}

	napi_get_named_property(env, argv[0], "name", &result);
	napi_get_value_string_utf8(env, result, buf, 128, &numbytes);
	printf("%s\n",buf);

	napi_get_named_property(env, argv[0], "strarr", &result);
	napi_get_array_length(env, result, &len);
	printf("length = %u\n", len);

	napi_get_element(env, result, 0, &element);
	napi_get_value_string_utf8(env, element, buf, 128, &numbytes);
	printf("%s\n", buf);
	napi_get_element(env, result, 1, &element);
	napi_get_value_string_utf8(env, element, buf, 128, &numbytes);
	printf("%s\n", buf);
	napi_get_element(env, result, 2, &element);
	napi_get_value_string_utf8(env, element, buf, 128, &numbytes);
	printf("%s\n", buf);
	return NULL;
}

napi_value Init(napi_env env, napi_value exports) {

	napi_status status;
	napi_value fn1, fn2, fn3, fn4, value;
	char str[] = "Mein eigenes Node-Modul";

	status = napi_create_function(env, NULL, 0, myFunction, NULL, &fn1);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to wrap native function");
	}

	status = napi_create_function(env, NULL, 0, timesTwo, NULL, &fn2);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to wrap native function");
	}

	status = napi_create_function(env, NULL, 0, myObject, NULL, &fn3);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to wrap native function");
	}

	status = napi_create_function(env, NULL, 0, readObject, NULL, &fn4);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to wrap native function");
	}

	status = napi_set_named_property(env, exports, "myFunction", fn1);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to populate exports");
	}

	status = napi_set_named_property(env, exports, "timesTwo", fn2);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to populate exports");
	}

	status = napi_set_named_property(env, exports, "myObject", fn3);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to populate exports");
	}

	status = napi_set_named_property(env, exports, "readObject", fn4);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to populate exports");
	}

	status = napi_create_string_utf8(env, str, strlen(str), &value);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to create String");
	}

	status = napi_set_named_property(env, exports, "description", value);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to populate exports");
	}

	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)