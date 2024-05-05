import {
  Button,
  CloseButton,
  Flex,
  FormControl,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import usePreviewImg from "../hooks/usePreviewingImg";
import { IoCreateOutline } from "react-icons/io5";
import { BsFillImageFill } from "react-icons/bs";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import { useParams } from "react-router-dom";

const MAX_CHAR = 500;
const MAX_IMAGES = 5;

const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postText, setPostText] = useState("");
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const imageRef = useRef(null);
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const user = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { username } = useParams();

  const handleTextChange = (e) => {
    const inputText = e.target.value;

    if (inputText.length > MAX_CHAR) {
      const truncatedText = inputText.slice(0, MAX_CHAR);
      setPostText(truncatedText);
      setRemainingChar(0);
    } else {
      setPostText(inputText);
      setRemainingChar(MAX_CHAR - inputText.length);
    }
  };

  const handleCreatePost = async () => {
    setLoading[true];
    const selectedFiles = imageRef.current.files;

    if (!selectedFiles.length) {
      showToast("Error", "Please select image(s) to upload", "error");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("caption", postText);

    for (let i = 0; i < selectedFiles.length && i < MAX_IMAGES; i++) {
      const file = selectedFiles[i];
      if (file && file.type.startsWith("image/")) {
        formData.append(`image`, file); // Assuming backend can handle multiple images
      }
    }

    // formData.append('image', selectedFiles);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:1000/post/create`, {
        method: "POST",
        credentials: "include",
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        showToast("Success", "Post created successfully", "success");
        // if (username === user?.username) {
        //   setPosts([data.post, ...posts]);
        // }
      } else {
        showToast("Error", data.error, "error");
        return;
      }

      const res2 = await fetch(`http://localhost:1000/post/${data.post._id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data2 = await res2.json();

      if (data2.error) {
        showToast("Error", data2.error, "error");
        return;
      }

      setPosts([data2.post, ...posts]);

      //   if (username === user.username) {
      //     setPosts([data.post, ...posts]);
      //   }
      onClose();
      setPostText("");
      setImgUrl([]);
      setRemainingChar(MAX_CHAR);
    } catch (error) {
      console.error("Error creating post:", error);
      showToast("Error", error, "error");
    }
  };

  return (
    <>
      <IconButton
        size={"sm"}
        icon={<IoCreateOutline size={30} />}
        onClick={onOpen}
        bg="transparent !important"
        _hover={{ bg: "transparent !important" }}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Textarea
                placeholder="Post content goes here..."
                onChange={handleTextChange}
                value={postText}
              />
              <Text
                fontSize="xs"
                fontWeight="bold"
                textAlign={"right"}
                m={"1"}
                color={"gray.800"}
              >
                {remainingChar}/{MAX_CHAR}
              </Text>

              <Input
                type="file"
                multiple
                hidden
                ref={imageRef}
                onChange={handleImageChange}
              />

              <BsFillImageFill
                style={{ marginLeft: "5px", cursor: "pointer" }}
                size={16}
                onClick={() => imageRef.current.click()}
              />
            </FormControl>

            {imgUrl.length > 0 && ( // Display previews only if images are selected
              <Flex mt={5} w={"full"} position={"relative"} flexWrap={"wrap"}>
                {imgUrl.map(
                  (
                    imageUrl,
                    index // Loop through each image URL
                  ) => (
                    <Image
                      key={index}
                      src={imageUrl}
                      alt={`Selected Image ${index + 1}`}
                      mr={2}
                      maxWidth="100%" // Ensure images don't overflow the modal width
                      maxHeight="200px" // Set a maximum height for previews (adjust as needed)
                      objectFit="cover" // Crop images to fit within the container
                    /> // Add unique keys and spacing
                  )
                )}
                <CloseButton
                  onClick={() => {
                    setImgUrl([]);
                  }}
                  // position={"absolute"}
                  top={2}
                  right={2}
                  size="md"
                />
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={handleCreatePost}
              isLoading={loading}
            >
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
