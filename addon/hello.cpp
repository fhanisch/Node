// cl /nologo /IC:\Users\Felix\.node-gyp\10.6.0\include\node /EHsc hello.cpp /link /DLL /out:test.node C:\Users\Felix\.node-gyp\10.6.0\x64\node.lib
// clang-cl /nologo /IC:\Users\Felix\.node-gyp\10.6.0\include\node /EHsc hello.cpp /link /DLL /out:test.node C:\Users\Felix\.node-gyp\10.6.0\x64\node.lib
// clang -I C:\Users\Felix\.node-gyp\10.6.0\include\node hello.cpp -shared -o test.node -l C:\Users\Felix\.node-gyp\10.6.0\x64\node.lib
// clang -I C:\Users\Felix\Downloads\node-10.8.0\src -I C:\Users\Felix\Downloads\node-10.8.0\deps\v8\include hello.cpp -shared -o test.node -l C:\Users\Felix\Downloads\node-10.8.0\Release\node.lib
#include <stdio.h>
#include <iostream>
#include <node.h>

class Person
{
protected:
	std::string name;
	std::string hobby;
	unsigned char age;
public:
	Person(std::string n, std::string h, unsigned char a)
	{
		name = n;
		hobby = h;
		age = a;
	}

	std::string getName() { return name; }
	std::string getHobby() { return hobby; }
	unsigned char getAge() { return age; }
};

namespace demo {

	using v8::FunctionCallbackInfo;
	using v8::Isolate;
	using v8::Local;
	using v8::Object;
	using v8::String;
	using v8::Value;
	using v8::Number;
	using v8::Array;
	using v8::ArrayBuffer;
	using v8::Float64Array;
	using v8::Integer;

	void Method(const FunctionCallbackInfo<Value>& args) {
		Isolate* isolate = args.GetIsolate();
		args.GetReturnValue().Set(String::NewFromUtf8(isolate, "*** HalliHallo ***"));
	}

	void getNumber(const FunctionCallbackInfo<Value>& args)
	{
		Isolate* isolate = args.GetIsolate();
		Local<Number> num = Number::New(isolate, 0.12345);
		args.GetReturnValue().Set(num);
	}

	void myObjects(const FunctionCallbackInfo<Value>& args)
	{
		//get Argument
		Isolate* isolate = args.GetIsolate();
		Local<Object> in = args[0]->ToObject();

		//get Object Property
		Local<Value> z = in->Get(String::NewFromUtf8(isolate, "num"));
		std::cout << z->IntegerValue();
		printf("\toder %lld\n", z->IntegerValue());
		
		//get Array from Object
		Local<Value> strArr = in->Get(String::NewFromUtf8(isolate, "strArr"));
		Local<Array> names = Local<Array>::Cast(strArr);
		char buf[32];
		for (unsigned int i = 0; i < names->Length(); i++)
		{
			Local<Value> n = names->Get(i);
			n->ToString()->WriteUtf8(buf, -1, NULL, 0);
			std::cout << "\t" << buf << std::endl;
		}

		//get typed float64 array from object
		Local<Value> floatArr = in->Get(String::NewFromUtf8(isolate, "floatArr"));
		Local<Float64Array> f = Local<Float64Array>::Cast(floatArr);
		std::cout << "Length of Array: " << f->Length() << std::endl;
		double *y = new double[f->Length() * sizeof(double)];
		f->CopyContents(y, f->Length() * sizeof(double));
		std::cout << "\t[";
		for (unsigned int i = 0; i < f->Length(); i++)
		{
			std::cout << " " << y[i];
			if (i < f->Length() - 1) std::cout << ",";
		}
		std::cout << " ]" << std::endl;
		delete(y);

		//create object to return
		Local<Object> out = Object::New(isolate);

		//create object properties
		Person p("Felix", "Schwimmen", 37);
		out->Set(String::NewFromUtf8(isolate, "value"), Number::New(isolate, 3.3333));
		out->Set(String::NewFromUtf8(isolate, "name"), String::NewFromUtf8(isolate, p.getName().c_str()));
		out->Set(String::NewFromUtf8(isolate, "age"), Integer::New(isolate,p.getAge()));

		//create typed float64 array to object
		double *x = new double[5];
		x[0] = 1.2345; x[1] = 344.009293; x[2] = -2332.99283; x[3] = -0.239488; x[4] = 521409348.3299;
		Local<ArrayBuffer> buffer = ArrayBuffer::New(isolate, x, 5*sizeof(double), v8::ArrayBufferCreationMode::kInternalized);
		Local<Float64Array> arr = Float64Array::New(buffer, 0, 5);
		out->Set(String::NewFromUtf8(isolate, "x"), arr);

		//set object to return
		args.GetReturnValue().Set(out);
	}

	void init(Local<Object> exports) {
		NODE_SET_METHOD(exports, "hello", Method);
		NODE_SET_METHOD(exports, "getNumber", getNumber);
		NODE_SET_METHOD(exports, "myObjects", myObjects);
	}
#define NODE_GYP_MODULE_NAME TestModule
	NODE_MODULE(NODE_GYP_MODULE_NAME, init)

}  // namespace demo